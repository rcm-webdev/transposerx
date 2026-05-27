import { useQuery } from "@tanstack/react-query";
import { BookOpen, FlipHorizontal, Trophy, Table2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { TransposeForm } from "@/components/TransposeForm";
import { HistoryList } from "@/components/HistoryList";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabel: Record<string, string> = {
  completed: "Done",
  started: "Started",
  not_started: "—",
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard.get,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                LESSONS DONE
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {data?.lessonsCompleted ?? "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {data?.totalLessons ?? 4}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <FlipHorizontal className="h-3.5 w-3.5" />
                TRANSPOSITIONS
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {data?.transpositionCount ?? "—"}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Trophy className="h-3.5 w-3.5" />
                BEST QUIZ
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">
                  {data?.bestQuiz
                    ? `${data.bestQuiz.score} / ${data.bestQuiz.total}`
                    : "—"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="gap-3 sm:gap-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                Lesson Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-32" />
                  <div className="space-y-1">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <Progress value={((data?.lessonsCompleted ?? 0) / (data?.totalLessons ?? 4)) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {data?.lessonsCompleted ?? 0} of {data?.totalLessons ?? 4} lessons completed
                  </p>
                  <div className="space-y-1">
                    {data?.lessonProgress.map((l) => (
                      <div
                        key={l.slug}
                        className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:items-center text-sm min-w-0"
                      >
                        <Link
                          to={`/lessons/${l.slug}`}
                          className="hover:underline min-w-0 break-words"
                        >
                          {l.title}
                        </Link>
                        <span
                          className={`text-xs shrink-0 ${l.status === "completed" ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                        >
                          {statusLabel[l.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="gap-3 sm:gap-4 min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Table2 className="h-4 w-4" />
                Recent Transpositions
              </CardTitle>
            </CardHeader>
            <CardContent className="min-w-0">
              {isLoading ? (
                <div className="space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : (
                <HistoryList records={data?.recentHistory ?? []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Transpose */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Transpose
          </h2>
          <div className="w-full max-w-xl">
            <TransposeForm />
          </div>
        </div>
      </main>
    </div>
  );
}
