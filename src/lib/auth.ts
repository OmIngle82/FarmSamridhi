
// This is a mock authentication service.
// In a real application, this would be replaced with a proper authentication provider like Firebase Auth.

export type UserRole = "farmer" | "distributor" | "retailer" | "consumer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}


// Mock database of users
const users: User[] = [
    { id: "1", name: "Suresh Patel", email: "farmer@example.com", role: "farmer" },
    { id: "2", name: "Deepak Chopra", email: "distributor@example.com", role: "distributor" },
    { id: "3", name: "Anjali Mehta", email: "retailer@example.com", role: "retailer" },
    { id: "4", name: "Ravi Kumar", email: "consumer@example.com", role: "consumer" },
];

const SESSION_STORAGE_KEY = "farmsamridhi_session";

// Simulate a network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockLogin(email: string, password: string): Promise<User | null> {
    await delay(500);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // In a real app, you'd check the password hash
    if (user && password) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

export async function mockSignup(data: SignupData): Promise<User | null> {
    await delay(500);
    const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
        return null; // User already exists
    }

    const newUser: User = {
        id: String(users.length + 1),
        name: data.name,
        email: data.email,
        role: data.role,
    };
    
    users.push(newUser);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
}

export async function mockLogout(): Promise<void> {
    await delay(200);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function mockGetSession(): Promise<User | null> {
    await delay(300);
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
        try {
            return JSON.parse(sessionData) as User;
        } catch (error) {
            console.error("Failed to parse session data", error);
            return null;
        }
    }
    return null;
}
