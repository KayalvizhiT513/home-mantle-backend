import { relations } from 'drizzle-orm';
import { appliances, maintenanceTasks, serviceContacts } from './schema.js';

export const appliancesRelations = relations(appliances, ({ many }) => ({
  maintenanceTasks: many(maintenanceTasks),
  serviceContacts: many(serviceContacts),
}));

export const maintenanceTasksRelations = relations(maintenanceTasks, ({ one }) => ({
  appliance: one(appliances, {
    fields: [maintenanceTasks.applianceId],
    references: [appliances.id],
  }),
}));

export const serviceContactsRelations = relations(serviceContacts, ({ one }) => ({
  appliance: one(appliances, {
    fields: [serviceContacts.applianceId],
    references: [appliances.id],
  }),
}));