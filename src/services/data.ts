
import { v4 as uuidv4 } from 'uuid';

// Mock data for our application
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
}

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  electionId: string;
  electionTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'voter';
  status: 'active' | 'blocked';
}

// Mock elections
const mockElections: Election[] = [
  {
    id: "1",
    title: "Student Council Election 2025",
    description: "Annual election for student council positions",
    startDate: new Date(2025, 5, 15),
    endDate: new Date(2025, 5, 20),
    status: "upcoming"
  },
  {
    id: "2",
    title: "Faculty Board Election",
    description: "Election for faculty board members",
    startDate: new Date(2025, 3, 10),
    endDate: new Date(2025, 3, 15),
    status: "completed"
  },
  {
    id: "3",
    title: "Department Chair Election",
    description: "Election for department chair position",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    status: "active"
  }
];

// Mock participants
const mockParticipants: Participant[] = [
  {
    id: "1",
    userId: "2",
    userName: "John Voter",
    userEmail: "voter@example.com",
    electionId: "1",
    electionTitle: "Student Council Election 2025",
    status: "pending",
    requestDate: new Date(2025, 4, 10)
  },
  {
    id: "2",
    userId: "3",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    electionId: "1",
    electionTitle: "Student Council Election 2025",
    status: "approved",
    requestDate: new Date(2025, 4, 8)
  },
  {
    id: "3",
    userId: "4",
    userName: "Michael Brown",
    userEmail: "michael@example.com",
    electionId: "3",
    electionTitle: "Department Chair Election",
    status: "rejected",
    requestDate: new Date(2025, 2, 15)
  }
];

// Mock users
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active"
  },
  {
    id: "2",
    name: "John Voter",
    email: "voter@example.com",
    role: "voter",
    status: "active"
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "voter",
    status: "active"
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "voter",
    status: "blocked"
  }
];

// Data service functions
export const getElections = (): Promise<Election[]> => {
  return Promise.resolve(mockElections);
};

export const getElection = (id: string): Promise<Election | undefined> => {
  return Promise.resolve(mockElections.find(election => election.id === id));
};

export const createElection = (election: Omit<Election, 'id'>): Promise<Election> => {
  const newElection = { ...election, id: uuidv4() };
  mockElections.push(newElection);
  return Promise.resolve(newElection);
};

export const getParticipantRequests = (): Promise<Participant[]> => {
  return Promise.resolve(mockParticipants);
};

export const updateParticipantStatus = (id: string, status: 'approved' | 'rejected'): Promise<Participant> => {
  const index = mockParticipants.findIndex(participant => participant.id === id);
  if (index !== -1) {
    mockParticipants[index].status = status;
    return Promise.resolve(mockParticipants[index]);
  }
  return Promise.reject(new Error('Participant not found'));
};

export const getUsers = (): Promise<User[]> => {
  return Promise.resolve(mockUsers);
};

export const toggleUserStatus = (id: string): Promise<User> => {
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers[index].status = mockUsers[index].status === 'active' ? 'blocked' : 'active';
    return Promise.resolve(mockUsers[index]);
  }
  return Promise.reject(new Error('User not found'));
};

export const requestToBeContestant = (userId: string, electionId: string): Promise<Participant> => {
  const user = mockUsers.find(u => u.id === userId);
  const election = mockElections.find(e => e.id === electionId);
  
  if (!user || !election) {
    return Promise.reject(new Error('User or Election not found'));
  }
  
  const newParticipant: Participant = {
    id: uuidv4(),
    userId,
    userName: user.name,
    userEmail: user.email,
    electionId,
    electionTitle: election.title,
    status: 'pending',
    requestDate: new Date()
  };
  
  mockParticipants.push(newParticipant);
  return Promise.resolve(newParticipant);
};
