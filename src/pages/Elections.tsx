import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { getElections, createElection, Election } from "@/services/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Elections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userId, setUserId] = useState<string | undefined>();

  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  if (user?.role !== "admin") return <Navigate to="/" />;


  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !startTime || !endTime) {
      toast({
        variant: "destructive",
        title: "Missing data",
        description: "Please select all dates and times.",
      });
      return;
    }

    const now = new Date();
    const start = new Date(`${format(startDate, "yyyy-MM-dd")}T${startTime}`);
    const end = new Date(`${format(endDate, "yyyy-MM-dd")}T${endTime}`);

    let status: "upcoming" | "active" | "completed" = "upcoming";
    if (start <= now && end >= now) status = "active";
    else if (end < now) status = "completed";

    try {
      const newElection = await createElection({
        title,
        startDate: start,
        endDate: end,
        status,
        userId: userId || null,
      });

      setElections([...elections, newElection]);
      setDialogOpen(false);
      resetForm();

      toast({
        title: "Election Created",
        description: "The election has been created successfully.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create election.",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime("");
    setEndTime("");
    setUserId(undefined);
  };

  const filteredElections = elections.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search elections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateElection}>
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule an election.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Election title"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-[150px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "flex-1 justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => !startDate || date < startDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-[150px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Assign User (Optional)</label>
                  <Select onValueChange={setUserId} value={userId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Election</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading elections...
                  </TableCell>
                </TableRow>
              ) : filteredElections.length > 0 ? (
                filteredElections.map((election) => (
                  <TableRow key={election.id}>
                    <TableCell className="font-medium">{election.title}</TableCell>
                    <TableCell>{new Date(election.startDate).toLocaleString()}</TableCell>
                    <TableCell>{new Date(election.endDate).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          election.status === "active"
                            ? "default"
                            : election.status === "upcoming"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {election.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No elections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Elections;
