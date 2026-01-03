import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, BookOpen, GraduationCap, Trash2, Edit2, Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { AssignmentCourse, Assignment } from "@shared/schema";

const courseEmojis = ["📚", "🧬", "⚛️", "🧪", "💭", "📐", "🎨", "🎵", "💻", "🌍", "📖", "🔬"];
const statusOptions = ["pending", "in_progress", "submitted", "graded"] as const;
const priorityOptions = ["low", "medium", "high"] as const;

export default function Assignments() {
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseEmoji, setNewCourseEmoji] = useState("📚");
  const [newCourseInstructor, setNewCourseInstructor] = useState("");
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    courseId: null as number | null,
    dueDate: "",
    priority: "medium" as typeof priorityOptions[number],
    weight: "",
  });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<AssignmentCourse[]>({
    queryKey: ["/api/assignment-courses"],
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: { name: string; emoji: string; instructor: string }) => {
      await apiRequest("POST", "/api/assignment-courses", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assignment-courses"] });
      setCourseDialogOpen(false);
      setNewCourseName("");
      setNewCourseEmoji("📚");
      setNewCourseInstructor("");
      toast({ title: "Course added" });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/assignment-courses/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assignment-courses"] });
      qc.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({ title: "Course deleted" });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/assignments", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assignments"] });
      setAssignmentDialogOpen(false);
      setNewAssignment({ title: "", courseId: null, dueDate: "", priority: "medium", weight: "" });
      toast({ title: "Assignment added" });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      await apiRequest("PATCH", `/api/assignments/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assignments"] });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/assignments/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({ title: "Assignment deleted" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> In Progress</Badge>;
      case "submitted":
        return <Badge className="gap-1 bg-blue-500"><CheckCircle2 className="h-3 w-3" /> Submitted</Badge>;
      case "graded":
        return <Badge className="gap-1 bg-chart-2"><CheckCircle2 className="h-3 w-3" /> Graded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-amber-500";
      default: return "text-muted-foreground";
    }
  };

  const getCourseById = (id: number | null) => courses.find(c => c.id === id);

  const calculateCourseGrade = (courseId: number) => {
    const courseAssignments = assignments.filter(a => a.courseId === courseId && a.gradePercent !== null);
    if (courseAssignments.length === 0) return null;
    const totalWeight = courseAssignments.reduce((sum, a) => sum + (a.weight || 0), 0);
    if (totalWeight === 0) return null;
    const weightedSum = courseAssignments.reduce((sum, a) => sum + ((a.gradePercent || 0) * (a.weight || 0)), 0);
    return Math.round(weightedSum / totalWeight);
  };

  const calculateOverallGPA = () => {
    const gradesWithCredits = courses.map(c => ({
      grade: calculateCourseGrade(c.id),
      credits: c.credits || 3,
    })).filter(g => g.grade !== null);
    
    if (gradesWithCredits.length === 0) return null;
    
    const totalCredits = gradesWithCredits.reduce((sum, g) => sum + g.credits, 0);
    const weightedGrade = gradesWithCredits.reduce((sum, g) => sum + ((g.grade || 0) * g.credits), 0);
    return Math.round(weightedGrade / totalCredits);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (coursesLoading || assignmentsLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const overallGPA = calculateOverallGPA();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <GraduationCap className="h-10 w-10" />
            Assignment Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Track your courses, assignments, and grades</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-course">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {courseEmojis.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewCourseEmoji(e)}
                      className={`w-10 h-10 text-xl rounded-lg hover-elevate ${newCourseEmoji === e ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div>
                  <Label>Course Name</Label>
                  <Input
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    placeholder="e.g., Biology 101"
                    data-testid="input-course-name"
                  />
                </div>
                <div>
                  <Label>Instructor</Label>
                  <Input
                    value={newCourseInstructor}
                    onChange={e => setNewCourseInstructor(e.target.value)}
                    placeholder="e.g., Prof. Smith"
                    data-testid="input-course-instructor"
                  />
                </div>
                <Button
                  onClick={() => createCourseMutation.mutate({
                    name: newCourseName,
                    emoji: newCourseEmoji,
                    instructor: newCourseInstructor,
                  })}
                  disabled={!newCourseName || createCourseMutation.isPending}
                  className="w-full"
                  data-testid="button-create-course"
                >
                  Add Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-assignment">
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newAssignment.title}
                    onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="e.g., Cell Structure Essay"
                    data-testid="input-assignment-title"
                  />
                </div>
                <div>
                  <Label>Course</Label>
                  <Select
                    value={newAssignment.courseId?.toString() || ""}
                    onValueChange={v => setNewAssignment({ ...newAssignment, courseId: parseInt(v) })}
                  >
                    <SelectTrigger data-testid="select-assignment-course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.emoji} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    data-testid="input-assignment-due-date"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newAssignment.priority}
                      onValueChange={v => setNewAssignment({ ...newAssignment, priority: v as typeof priorityOptions[number] })}
                    >
                      <SelectTrigger data-testid="select-assignment-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Weight (%)</Label>
                    <Input
                      type="number"
                      value={newAssignment.weight}
                      onChange={e => setNewAssignment({ ...newAssignment, weight: e.target.value })}
                      placeholder="e.g., 15"
                      data-testid="input-assignment-weight"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => createAssignmentMutation.mutate({
                    ...newAssignment,
                    weight: newAssignment.weight ? parseFloat(newAssignment.weight) : undefined,
                    dueDate: newAssignment.dueDate || undefined,
                  })}
                  disabled={!newAssignment.title || createAssignmentMutation.isPending}
                  className="w-full"
                  data-testid="button-create-assignment"
                >
                  Add Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {overallGPA !== null && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-chart-2/10 flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Average Grade</p>
            <p className="text-4xl font-bold">{overallGPA}%</p>
          </div>
          <div className="flex-1">
            <Progress value={overallGPA} className="h-3" />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Courses</h2>
        {courses.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-muted/30">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No courses yet. Add your first course to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => {
              const grade = calculateCourseGrade(course.id);
              const courseAssignments = assignments.filter(a => a.courseId === course.id);
              return (
                <div key={course.id} className="p-4 rounded-xl bg-card hover-elevate" data-testid={`card-course-${course.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{course.emoji}</span>
                      <div>
                        <h3 className="font-semibold">{course.name}</h3>
                        {course.instructor && (
                          <p className="text-sm text-muted-foreground">{course.instructor}</p>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the course and all its assignments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCourseMutation.mutate(course.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {courseAssignments.length} assignments
                    </span>
                    {grade !== null && (
                      <Badge variant={grade >= 70 ? "default" : "destructive"}>
                        {grade}%
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Assignments</h2>
        {assignments.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-muted/30">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No assignments yet. Add one to start tracking.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Assignment</th>
                  <th className="text-left p-4 font-medium">Course</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Grade</th>
                  <th className="text-left p-4 font-medium">Weight</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(assignment => {
                  const course = getCourseById(assignment.courseId);
                  return (
                    <tr key={assignment.id} className="border-t border-border" data-testid={`row-assignment-${assignment.id}`}>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className={`text-xs capitalize ${getPriorityColor(assignment.priority || "medium")}`}>
                            {assignment.priority} priority
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {course ? (
                          <span>{course.emoji} {course.name}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {assignment.dueDate ? formatDate(assignment.dueDate) : "-"}
                      </td>
                      <td className="p-4">
                        <Select
                          value={assignment.status || "pending"}
                          onValueChange={v => updateAssignmentMutation.mutate({ id: assignment.id, status: v })}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(s => (
                              <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          className="w-20 h-8"
                          placeholder="-"
                          value={assignment.gradePercent ?? ""}
                          onChange={e => updateAssignmentMutation.mutate({
                            id: assignment.id,
                            gradePercent: e.target.value ? parseFloat(e.target.value) : null,
                          })}
                        />
                      </td>
                      <td className="p-4 text-sm">
                        {assignment.weight ? `${assignment.weight}%` : "-"}
                      </td>
                      <td className="p-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
