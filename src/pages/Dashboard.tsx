
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getElections, Election } from "@/services/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Vote, Users, Clock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await getElections();
        setElections(data);
        setLoading(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch elections. Please try again later.",
        });
        setLoading(false);
      }
    };

    fetchElections();
  }, [toast]);

  // Admin dashboard
  if (user?.role === "admin") {
    return (
      <div className="space-y-6">
        <div className="dashboard-grid">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Total Elections</CardTitle>
                <CardDescription>All managed elections</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{elections.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Active Elections</CardTitle>
                <CardDescription>Currently running</CardDescription>
              </div>
              <Vote className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {elections.filter(e => e.status === "active").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Upcoming Elections</CardTitle>
                <CardDescription>Scheduled for future</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {elections.filter(e => e.status === "upcoming").length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="section-header">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild>
              <Link to="/elections">Manage Elections</Link>
            </Button>
            <Button asChild>
              <Link to="/users">Manage Users</Link>
            </Button>
            <Button asChild>
              <Link to="/requests">View Participant Requests</Link>
            </Button>
          </div>
        </div>
        
        <div>
          <h2 className="section-header">Recent Elections</h2>
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">Loading elections...</CardContent>
              </Card>
            ) : elections.length > 0 ? (
              elections.slice(0, 3).map((election) => (
                <Card key={election.id}>
                  <CardHeader>
                    <CardTitle>{election.title}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className="text-sm font-medium">
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              election.status === "active" 
                                ? "bg-green-100 text-green-800" 
                                : election.status === "upcoming" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Start Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(election.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">End Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">No elections found.</CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Voter dashboard
  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-header">Available Elections</h2>
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">Loading elections...</CardContent>
            </Card>
          ) : elections.filter(e => e.status === "active").length > 0 ? (
            elections
              .filter(e => e.status === "active")
              .map((election) => (
                <Card key={election.id}>
                  <CardHeader>
                    <CardTitle>{election.title}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className="text-sm font-medium">
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                            Active
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">End Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button asChild variant="outline">
                      <Link to={`/vote/${election.id}`}>Vote Now</Link>
                    </Button>
                    <Button asChild>
                      <Link to={`/vote/${election.id}?action=request`}>Request to Participate</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                No active elections available. Check back later!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="section-header">Upcoming Elections</h2>
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">Loading elections...</CardContent>
            </Card>
          ) : elections.filter(e => e.status === "upcoming").length > 0 ? (
            elections
              .filter(e => e.status === "upcoming")
              .map((election) => (
                <Card key={election.id}>
                  <CardHeader>
                    <CardTitle>{election.title}</CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className="text-sm font-medium">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            Upcoming
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Start Date:</span>
                        <span className="text-sm font-medium">
                          {new Date(election.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                No upcoming elections scheduled.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
