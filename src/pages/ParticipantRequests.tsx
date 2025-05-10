
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { getParticipantRequests, updateParticipantStatus, Participant } from "@/services/data";
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

const ParticipantRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Redirect non-admin users
  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await getParticipantRequests();
        setParticipants(data);
        setLoading(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch participant requests. Please try again later.",
        });
        setLoading(false);
      }
    };
    
    fetchParticipants();
  }, [toast]);
  
  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updatedParticipant = await updateParticipantStatus(id, status);
      setParticipants(participants.map(p => p.id === id ? updatedParticipant : p));
      toast({
        title: "Request Updated",
        description: `The participant request has been ${status}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update participant status. Please try again.",
      });
    }
  };
  
  const filteredParticipants = participants.filter(p => 
    p.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.electionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Election</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading participant requests...
                  </TableCell>
                </TableRow>
              ) : filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">{participant.userName}</TableCell>
                    <TableCell>{participant.userEmail}</TableCell>
                    <TableCell>{participant.electionTitle}</TableCell>
                    <TableCell>{new Date(participant.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          participant.status === "approved" 
                            ? "default" 
                            : participant.status === "rejected" 
                            ? "destructive" 
                            : "outline"
                        }
                      >
                        {participant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {participant.status === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => handleUpdateStatus(participant.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleUpdateStatus(participant.id, "rejected")}
                          >
                            Deny
                          </Button>
                        </>
                      )}
                      {participant.status !== "pending" && (
                        <span className="text-sm text-muted-foreground">No actions available</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No participant requests found.
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

export default ParticipantRequests;
