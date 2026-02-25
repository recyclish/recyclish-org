import { relations } from "drizzle-orm/relations";
import { shelters, shelterCorrections } from "./schema";

export const shelterCorrectionsRelations = relations(shelterCorrections, ({one}) => ({
	shelter: one(shelters, {
		fields: [shelterCorrections.shelterId],
		references: [shelters.id]
	}),
}));

export const sheltersRelations = relations(shelters, ({many}) => ({
	shelterCorrections: many(shelterCorrections),
}));