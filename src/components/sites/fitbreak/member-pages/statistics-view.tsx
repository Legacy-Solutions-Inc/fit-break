"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import {
  overviewStats,
  weeklyActivityMinutes,
  weeklyProgress,
  workoutTypeCounts,
  type ActivityBooking,
  type ActivityWorkout,
} from "./stats";
import { useIsClient } from "./use-toast";

const BRAND = "#D71E49";

const activityConfig = { minutes: { label: "Minutes", color: BRAND } } satisfies ChartConfig;
const progressConfig = { workouts: { label: "Workouts", color: BRAND } } satisfies ChartConfig;
const typesConfig = {
  cardio: { label: "Cardio", color: "#60a5fa" },
  strength: { label: "Strength", color: "#fbbf24" },
  flexibility: { label: "Flexibility", color: "#4ade80" },
  hiit: { label: "HIIT", color: BRAND },
} satisfies ChartConfig;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKS = ["3 Weeks Ago", "2 Weeks Ago", "Last Week", "This Week"];

function Svg({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

const card = "rounded-2xl border border-gray-100 bg-white shadow-xs";

export function StatisticsView({
  bookings,
  workouts,
  memberSince,
}: {
  bookings: ActivityBooking[];
  workouts: ActivityWorkout[];
  memberSince: string;
}) {
  const isClient = useIsClient();
  const now = new Date();

  const overview = isClient
    ? overviewStats(bookings, workouts, now)
    : { totalWorkouts: 0, calories: 0, hours: 0, streak: 0 };
  const minutes = isClient ? weeklyActivityMinutes(bookings, workouts, now) : [0, 0, 0, 0, 0, 0, 0];
  const progress = isClient ? weeklyProgress(bookings, workouts, now) : [0, 0, 0, 0];
  const types = workoutTypeCounts(bookings, workouts);
  const hasTypes = Object.values(types).some((v) => v > 0);

  const activityData = DAYS.map((day, i) => ({ day, minutes: minutes[i] ?? 0 }));
  const progressData = WEEKS.map((week, i) => ({ week, workouts: progress[i] ?? 0 }));
  // Empty state, as the source: four equal slices whose tooltip reads "No data yet".
  const typesData = (Object.keys(typesConfig) as (keyof typeof typesConfig)[]).map((key) => ({
    key,
    value: hasTypes ? types[key] : 1,
    fill: typesConfig[key].color,
  }));

  const daysMember = isClient
    ? Math.floor((now.getTime() - new Date(memberSince).getTime()) / 86_400_000)
    : 0;
  const total = overview.totalWorkouts;
  const streak = overview.streak;
  const achievements = [
    { emoji: "🔥", title: "First Workout", value: total, goal: 1 },
    { emoji: "🏆", title: "7 Day Streak", value: streak, goal: 7 },
    { emoji: "💪", title: "10 Workouts", value: total, goal: 10 },
    { emoji: "⭐", title: "30 Day Member", value: daysMember, goal: 30 },
    { emoji: "🎯", title: "25 Workouts", value: total, goal: 25 },
    { emoji: "🌟", title: "14 Day Streak", value: streak, goal: 14 },
    { emoji: "👑", title: "50 Workouts", value: total, goal: 50 },
    { emoji: "💎", title: "90 Day Member", value: daysMember, goal: 90 },
  ];

  const statCards = [
    {
      label: "Total Workouts",
      value: String(overview.totalWorkouts),
      box: "bg-brand-50",
      text: "text-brand-500",
      d: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      label: "Calories Burned",
      value: Math.round(overview.calories).toLocaleString("en-US"),
      box: "bg-orange-50",
      text: "text-orange-500",
      d: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    },
    {
      label: "Hours Active",
      value: overview.hours.toFixed(1),
      box: "bg-green-50",
      text: "text-green-500",
      d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Day Streak",
      value: String(overview.streak),
      box: "bg-purple-50",
      text: "text-purple-500",
      d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className={cn(card, "p-5")}>
            <div className="mb-2 flex items-center gap-3">
              <div className={cn("rounded-lg p-2", s.box)}>
                <Svg d={s.d} className={cn("h-5 w-5", s.text)} />
              </div>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{isClient ? s.value : "0"}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(card, "p-6")}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
            {/* Present but unwired on the source too: the chart always shows this week. */}
            <label htmlFor="activity-period" className="sr-only">
              Activity period
            </label>
            <select
              id="activity-period"
              defaultValue="week"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="h-64">
            <ChartContainer config={activityConfig} className="aspect-auto h-full w-full">
              <BarChart data={activityData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={48}>
                  <Label
                    value="Minutes"
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: "middle" }}
                  />
                </YAxis>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={8} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className={cn(card, "p-6")}>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Workout Types</h2>
          <div className="h-64">
            <ChartContainer config={typesConfig} className="aspect-auto h-full w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="key"
                      hideLabel
                      formatter={(value, _name, item) => {
                        const key = (item.payload as { key: keyof typeof typesConfig }).key;
                        return hasTypes
                          ? `${typesConfig[key].label}: ${String(value)} classes`
                          : "No data yet";
                      }}
                    />
                  }
                />
                <Pie
                  data={typesData}
                  dataKey="value"
                  nameKey="key"
                  innerRadius="50%"
                  outerRadius="80%"
                  strokeWidth={2}
                >
                  {typesData.map((d) => (
                    <Cell key={d.key} fill={d.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  verticalAlign="bottom"
                  content={<ChartLegendContent nameKey="key" />}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </div>

        <div className={cn(card, "p-6 lg:col-span-2")}>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Progress Over Time</h2>
          <div className="h-64">
            <ChartContainer config={progressConfig} className="aspect-auto h-full w-full">
              <AreaChart data={progressData} margin={{ left: 8, right: 16, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={48}>
                  <Label
                    value="Classes"
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: "middle" }}
                  />
                </YAxis>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area
                  dataKey="workouts"
                  type="monotone"
                  stroke="var(--color-workouts)"
                  strokeWidth={3}
                  fill="rgba(215, 30, 73, 0.1)"
                  fillOpacity={1}
                  dot={{ r: 3, fill: "var(--color-workouts)" }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        <div className={cn(card, "p-6 lg:col-span-2")}>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Achievements</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {achievements.map((a) => {
              const value = Math.min(a.value, a.goal);
              const unlocked = a.value >= a.goal;
              return (
                <div
                  key={a.title}
                  className={cn("rounded-xl bg-gray-50 p-4 text-center", !unlocked && "opacity-60")}
                >
                  <div
                    className={cn(
                      "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full",
                      unlocked ? "bg-yellow-100" : "bg-gray-200",
                    )}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {a.emoji}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{a.title}</p>
                  <p className={cn("text-xs", unlocked ? "text-green-600" : "text-gray-500")}>
                    {unlocked
                      ? "Completed!"
                      : `${value}/${a.goal} (${Math.round((value / a.goal) * 100)}%)`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
