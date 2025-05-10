
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getElection, Election, requestToBeContestant } from "@/services/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Vote = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  
  // Mock candidates for the election
  const mockCandidates = [
    { id: "c1", name: "Jane Smith", position: "President" },
    { id: "c2", name: "Michael Brown", position: "President" },
    { id: "c3", name: "Sarah Johnson", position: "President" },
  ];
  
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }
    
    const fetchElection = async () => {
      try {
        const data = await getElection(id);
        if (data) {
          setElection(data);
        } else {
          toast({
            variant: "destructive",
            title: "Election not found",
            description: "The requested election could not be found.",
          });
          navigate("/");
        }
        setLoading(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch election details. Please try again later.",
        });
        navigate("/");
      }
    };
    
    fetchElection();
  }, [id, navigate, toast]);
  
  const handleVote = () => {
    if (!selectedCandidate) {
      toast({
        variant: "destructive",
        title: "No candidate selected",
        description: "Please select a candidate to vote for.",
      });
      return;
    }
    
    setSubmitting(true);
    
    // Simulate vote submission
    setTimeout(() => {
      setHasVoted(true);
      setSubmitting(false);
      toast({
        title: "Vote submitted",
        description: "Your vote has been submitted successfully.",
      });
    }, 1500);
  };
  
  const handleRequestParticipation = async () => {
    if (!user || !election) return;
    
    setSubmitting(true);
    
    try {
      await requestToBeContestant(user.id, election.id);
      setRequestSubmitted(true);
      toast({
        title: "Request submitted",
        description: "Your request to participate has been submitted for review.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit participation request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          Loading election details...
        </CardContent>
      </Card>
    );
  }
  
  if (!election) {
    return (
      <Card>
        <CardContent className="pt-6">
          Election not found.
        </CardContent>
      </Card>
    );
  }
  
  // Check if the election is active
  if (election.status !== "active" && !action) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{election.title}</CardTitle>
         
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>
              This election is not currently active. 
              {election.status === "upcoming" ? " It will start on " + new Date(election.startDate).toLocaleDateString() : " It ended on " + new Date(election.endDate).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/")}>Back to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Request to be a contestant view
  if (action === "request") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request to Participate in {election.title}</CardTitle>
          <CardDescription>Submit your request to be a contestant in this election</CardDescription>
        </CardHeader>
        <CardContent>
          {requestSubmitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Request Submitted</h3>
              <p className="text-muted-foreground">
                Your request to participate in this election has been submitted for review. 
                You will be notified once it's been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Election Information</h3>
                <p><strong>Title:</strong> {election.title}</p>   
                <p><strong>Start Date:</strong> {new Date(election.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(election.endDate).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Your Information</h3>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
          {!requestSubmitted && (
            <Button onClick={handleRequestParticipation} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Voting view
  return (
    <Card>
      <CardHeader>
        <CardTitle>{election.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasVoted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Vote Submitted</h3>
            <p className="text-muted-foreground">
              Thank you for participating in this election. Your vote has been recorded.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-4">Select a Candidate</h3>
            <div className="space-y-4">
              {mockCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  className={`p-4 rounded-lg cursor-pointer border ${
                    selectedCandidate === candidate.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{candidate.name}</h4>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
        {!hasVoted && (
          <Button onClick={handleVote} disabled={!selectedCandidate || submitting}>
            {submitting ? "Submitting..." : "Submit Vote"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Vote;
