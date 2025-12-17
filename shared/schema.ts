import { z } from "zod";

export const prioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof prioritySchema>;

export const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Task text is required"),
  completed: z.boolean(),
  priority: prioritySchema.default("medium"),
  dueDate: z.string().nullable().default(null),
  category: z.string().nullable().default(null),
});

export const insertTaskSchema = taskSchema.omit({ id: true });

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export const filterSchema = z.enum(["all", "active", "completed"]);
export type FilterType = z.infer<typeof filterSchema>;
