import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { LessonCard } from "@/components/LessonCard";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";

export default function Lessons() {
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: api.lessons.list,
  });

  const completed =
    lessons?.filter((l) => l.status === "completed").length ?? 0;
  const total = Math.max(lessons?.length ?? 4, 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lessons</h1>
          <Link
            to="/practice"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Brain className="h-4 w-4 mr-1" />
            Practice Mode
          </Link>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>
              {completed} of {total} completed
            </span>
          </div>
          <Progress value={(completed / total) * 100} />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {lessons?.map((lesson) => (
              <LessonCard key={lesson.slug} lesson={lesson} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
