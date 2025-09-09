import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
export const appliances = pgTable('appliances', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    brand: text('brand'),
    model: text('model'),
    serialNumber: text('serial_number'),
    purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull(),
    warrantyDuration: integer('warranty_duration').notNull(), // in months
    warrantyEndDate: timestamp('warranty_end_date', { withTimezone: true }).notNull(),
    purchaseLocation: text('purchase_location'),
    notes: text('notes'),
    category: text('category').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const maintenanceTasks = pgTable('maintenance_tasks', {
    id: text('id').primaryKey(),
    applianceId: text('appliance_id').notNull().references(() => appliances.id, { onDelete: 'cascade' }),
    taskName: text('task_name').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    frequency: text('frequency'), // 'once' | 'monthly' | 'quarterly' | 'yearly'
    serviceProvider: text('service_provider'),
    contactInfo: text('contact_info'),
    notes: text('notes'),
    completed: boolean('completed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const serviceContacts = pgTable('service_contacts', {
    id: text('id').primaryKey(),
    applianceId: text('appliance_id').notNull().references(() => appliances.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    role: text('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
