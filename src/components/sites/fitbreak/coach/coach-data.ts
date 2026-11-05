import { asset, routes } from "../links";
import type { CertificationIconName } from "./certification-icons";

/*
 * Coach Iren's published profile (calapan1/about.html). Shared by the coach page
 * and its Person structured data so the two can't disagree.
 */

export const coach = {
  name: "Iren San Buenaventura",
  jobTitle: "FitBreak Owner & Head Coach",
  image: asset("/images/iren_new.jpg"),
  path: routes.coach,
} as const;

/** Her nine professional certifications, in the order the page lists them. */
export const certifications: ReadonlyArray<{
  icon: CertificationIconName;
  title: string;
  text: string;
}> = [
  {
    icon: "badgeCheck",
    title: "Certified Personal Trainer",
    text: "Professional certification in personal training and fitness instruction",
  },
  {
    icon: "bolt",
    title: "Functional Fitness Essentials",
    text: "Specialized in functional movement patterns and training",
  },
  {
    icon: "clipboard",
    title: "Functional Anatomy & Adaptive Fitness",
    text: "Training in anatomy and adaptive fitness techniques",
  },
  {
    icon: "eye",
    title: "Movement Analysis & Corrective Strategies",
    text: "Expert in identifying and correcting movement patterns",
  },
  {
    icon: "heart",
    title: "Obesity Exercise Specialist",
    text: "Specialized training for weight management clients",
  },
  {
    icon: "bookOpen",
    title: "Nutrition Essentials",
    text: "Certified in nutrition fundamentals and dietary guidance",
  },
  {
    icon: "chartBar",
    title: "Nutrition for Obesity & Weight Management",
    text: "Advanced certification in weight management nutrition",
  },
  {
    icon: "fire",
    title: "HIIT FIT Certified Instructor",
    text: "Certified to lead high-intensity interval training",
  },
  {
    icon: "bolt",
    title: "Certified MetCon L1 Specialist",
    text: "Metabolic conditioning specialist certification",
  },
];
