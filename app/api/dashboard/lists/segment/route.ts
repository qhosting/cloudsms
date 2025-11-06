
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/dashboard/lists/segment - Create a segment or preview segmentation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      criteria,
      sourceListIds = [],
      previewOnly = false,
      name,
      description 
    } = body;

    if (!criteria || !criteria.rules || criteria.rules.length === 0) {
      return NextResponse.json(
        { error: 'Criterios de segmentación requeridos' },
        { status: 400 }
      );
    }

    // Get base contacts to segment from
    let baseContacts;
    
    if (sourceListIds.length > 0) {
      // Segment from specific lists
      baseContacts = await prisma.contact.findMany({
        where: {
          contactListId: { in: sourceListIds },
          contactList: {
            companyId: session.user.companyId
          }
        },
        include: {
          subscriptions: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
    } else {
      // Segment from all company contacts
      baseContacts = await prisma.contact.findMany({
        where: {
          contactList: {
            companyId: session.user.companyId
          }
        },
        include: {
          subscriptions: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
    }

    // Apply segmentation criteria
    const segmentedContacts = applySegmentationCriteria(baseContacts, criteria);

    if (previewOnly) {
      // Return preview without creating list
      return NextResponse.json({
        totalMatching: segmentedContacts.length,
        totalBase: baseContacts.length,
        matchPercentage: baseContacts.length > 0 
          ? Math.round((segmentedContacts.length / baseContacts.length) * 100) 
          : 0,
        preview: segmentedContacts.slice(0, 10).map(contact => ({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
          email: contact.email,
          company: contact.company,
          tags: contact.tags,
          score: contact.score
        })),
        criteria
      });
    }

    // Create new segmented list
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nombre de la lista es requerido' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingList = await prisma.contactList.findFirst({
      where: {
        companyId: session.user.companyId,
        name: name.trim()
      }
    });

    if (existingList) {
      return NextResponse.json(
        { error: 'Ya existe una lista con este nombre' },
        { status: 400 }
      );
    }

    // Create the segmented list
    const newList = await prisma.contactList.create({
      data: {
        name: name.trim(),
        description,
        type: 'SEGMENT',
        segmentCriteria: criteria,
        companyId: session.user.companyId,
        createdById: session.user.id,
        totalContacts: segmentedContacts.length,
        validContacts: segmentedContacts.filter(c => c.isValid).length
      }
    });

    // Add contacts to the new list
    let addedCount = 0;
    for (const contact of segmentedContacts) {
      try {
        const newContact = await prisma.contact.create({
          data: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            jobTitle: contact.jobTitle,
            city: contact.city,
            state: contact.state,
            country: contact.country,
            zipCode: contact.zipCode,
            birthDate: contact.birthDate,
            gender: contact.gender,
            tags: contact.tags,
            customFields: contact.customFields,
            isValid: contact.isValid,
            isActive: contact.isActive,
            score: contact.score,
            messageCount: contact.messageCount,
            campaignCount: contact.campaignCount,
            lastMessageAt: contact.lastMessageAt,
            lastOpenedAt: contact.lastOpenedAt,
            contactListId: newList.id
          }
        });

        // Create subscription record
        await prisma.contactSubscription.create({
          data: {
            contactId: newContact.id,
            contactListId: newList.id,
            status: 'SUBSCRIBED',
            subscribedAt: new Date(),
            source: 'segmentation'
          }
        });

        // Log activity
        await prisma.contactActivity.create({
          data: {
            contactId: newContact.id,
            type: 'LIST_ADDED',
            description: `Added to segmented list: ${newList.name}`,
            metadata: {
              listId: newList.id,
              listName: newList.name,
              segmentationCriteria: criteria
            }
          }
        });

        addedCount++;
      } catch (error) {
        console.warn(`Could not add contact ${contact.phone} to segment:`, error);
      }
    }

    // Update final statistics
    await prisma.contactList.update({
      where: { id: newList.id },
      data: {
        totalContacts: addedCount,
        subscribedCount: addedCount
      }
    });

    return NextResponse.json({
      list: newList,
      totalMatching: segmentedContacts.length,
      contactsAdded: addedCount,
      message: `Lista segmentada creada con ${addedCount} contactos`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Helper function to apply segmentation criteria
function applySegmentationCriteria(contacts: any[], criteria: any): any[] {
  if (!criteria || !criteria.rules || criteria.rules.length === 0) {
    return contacts;
  }

  const operator = criteria.operator || 'AND'; // AND or OR

  return contacts.filter(contact => {
    const results = criteria.rules.map((rule: any) => {
      return matchesSegmentationRule(contact, rule);
    });

    if (operator === 'OR') {
      return results.some((result: any) => result);
    } else {
      return results.every((result: any) => result);
    }
  });
}

// Helper function to check if contact matches a segmentation rule
function matchesSegmentationRule(contact: any, rule: any): boolean {
  const { field, operator, value, dataType = 'string' } = rule;
  
  let contactValue = getContactFieldValue(contact, field);
  
  // Handle different data types
  if (dataType === 'number') {
    contactValue = Number(contactValue) || 0;
    const numValue = Number(value) || 0;
    
    switch (operator) {
      case 'equals': return contactValue === numValue;
      case 'not_equals': return contactValue !== numValue;
      case 'greater_than': return contactValue > numValue;
      case 'less_than': return contactValue < numValue;
      case 'greater_equal': return contactValue >= numValue;
      case 'less_equal': return contactValue <= numValue;
      default: return false;
    }
  }
  
  if (dataType === 'date') {
    const contactDate = new Date(contactValue);
    const ruleDate = new Date(value);
    
    if (isNaN(contactDate.getTime()) || isNaN(ruleDate.getTime())) {
      return false;
    }
    
    switch (operator) {
      case 'equals': return contactDate.getTime() === ruleDate.getTime();
      case 'not_equals': return contactDate.getTime() !== ruleDate.getTime();
      case 'after': return contactDate > ruleDate;
      case 'before': return contactDate < ruleDate;
      case 'after_equal': return contactDate >= ruleDate;
      case 'before_equal': return contactDate <= ruleDate;
      case 'last_days': {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(value));
        return contactDate >= daysAgo;
      }
      default: return false;
    }
  }
  
  if (dataType === 'array' || field === 'tags') {
    const contactArray = Array.isArray(contactValue) ? contactValue : [];
    
    switch (operator) {
      case 'contains': return contactArray.includes(value);
      case 'not_contains': return !contactArray.includes(value);
      case 'contains_any': return Array.isArray(value) && value.some(v => contactArray.includes(v));
      case 'contains_all': return Array.isArray(value) && value.every(v => contactArray.includes(v));
      case 'is_empty': return contactArray.length === 0;
      case 'is_not_empty': return contactArray.length > 0;
      default: return false;
    }
  }
  
  if (dataType === 'boolean') {
    const contactBool = Boolean(contactValue);
    const ruleBool = Boolean(value);
    return contactBool === ruleBool;
  }
  
  // Default to string operations
  const contactStr = String(contactValue || '').toLowerCase();
  const valueStr = String(value || '').toLowerCase();
  
  switch (operator) {
    case 'equals': return contactStr === valueStr;
    case 'not_equals': return contactStr !== valueStr;
    case 'contains': return contactStr.includes(valueStr);
    case 'not_contains': return !contactStr.includes(valueStr);
    case 'starts_with': return contactStr.startsWith(valueStr);
    case 'ends_with': return contactStr.endsWith(valueStr);
    case 'is_empty': return contactStr === '';
    case 'is_not_empty': return contactStr !== '';
    case 'regex_match': {
      try {
        const regex = new RegExp(value, 'i');
        return regex.test(contactStr);
      } catch {
        return false;
      }
    }
    default: return false;
  }
}

// Helper function to get contact field value for segmentation
function getContactFieldValue(contact: any, field: string): any {
  const fieldMap: Record<string, any> = {
    // Basic fields
    'firstName': contact.firstName,
    'lastName': contact.lastName,
    'fullName': `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    'email': contact.email,
    'phone': contact.phone,
    'company': contact.company,
    'jobTitle': contact.jobTitle,
    
    // Geographic
    'city': contact.city,
    'state': contact.state,
    'country': contact.country,
    'zipCode': contact.zipCode,
    
    // Demographic
    'birthDate': contact.birthDate,
    'gender': contact.gender,
    'age': contact.birthDate ? calculateAge(contact.birthDate) : null,
    
    // Engagement
    'score': contact.score,
    'messageCount': contact.messageCount,
    'campaignCount': contact.campaignCount,
    'lastMessageAt': contact.lastMessageAt,
    'lastOpenedAt': contact.lastOpenedAt,
    'daysSinceLastMessage': contact.lastMessageAt ? daysBetween(contact.lastMessageAt, new Date()) : null,
    'daysSinceCreated': daysBetween(contact.createdAt, new Date()),
    
    // Status
    'isValid': contact.isValid,
    'isActive': contact.isActive,
    'tags': contact.tags,
    'createdAt': contact.createdAt,
    'updatedAt': contact.updatedAt,
    
    // Subscription status
    'subscriptionStatus': contact.subscriptions?.[0]?.status || 'SUBSCRIBED',
    'isSubscribed': (contact.subscriptions?.[0]?.status || 'SUBSCRIBED') === 'SUBSCRIBED',
    
    // Recent activity
    'hasRecentActivity': contact.activities?.length > 0,
    'lastActivityType': contact.activities?.[0]?.type,
    'lastActivityDate': contact.activities?.[0]?.createdAt
  };
  
  // Custom fields
  if (field.startsWith('custom.') && contact.customFields) {
    const customFieldName = field.replace('custom.', '');
    return contact.customFields[customFieldName];
  }
  
  return fieldMap[field] || null;
}

// Helper function to calculate age from birthdate
function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to calculate days between dates
function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}
