import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users with full details
 *     description: Retrieve all users with their complete profile information including accounts, sessions, authenticators, owned boards, board memberships, assigned tasks, and task comments. Requires authentication.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users with complete details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/User'
 *                   - type: object
 *                     properties:
 *                       accounts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: Account ID
 *                             userId:
 *                               type: string
 *                               description: User ID
 *                             type:
 *                               type: string
 *                               description: Account type
 *                             provider:
 *                               type: string
 *                               description: OAuth provider (e.g., google, github)
 *                             providerAccountId:
 *                               type: string
 *                               description: Provider account ID
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                         description: User's OAuth accounts
 *                       sessions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: Session ID
 *                             sessionToken:
 *                               type: string
 *                               description: Session token
 *                             userId:
 *                               type: string
 *                               description: User ID
 *                             expires:
 *                               type: string
 *                               format: date-time
 *                               description: Session expiration date
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                         description: User's active sessions
 *                       Authenticator:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             credentialID:
 *                               type: string
 *                               description: WebAuthn credential ID
 *                             userId:
 *                               type: string
 *                               description: User ID
 *                             providerAccountId:
 *                               type: string
 *                               description: Provider account ID
 *                             credentialPublicKey:
 *                               type: string
 *                               description: Public key for WebAuthn
 *                             counter:
 *                               type: integer
 *                               description: WebAuthn counter
 *                             credentialDeviceType:
 *                               type: string
 *                               description: Device type
 *                             credentialBackedUp:
 *                               type: boolean
 *                               description: Whether credential is backed up
 *                             transports:
 *                               type: string
 *                               nullable: true
 *                               description: Transport methods
 *                         description: User's WebAuthn authenticators
 *                       ownedBoards:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Board'
 *                         description: Boards owned by the user
 *                       boardMembers:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/BoardMember'
 *                         description: Board memberships of the user
 *                       assignedTasks:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Task'
 *                         description: Tasks assigned to the user
 *                       taskComments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: Comment ID
 *                             content:
 *                               type: string
 *                               description: Comment content
 *                             taskId:
 *                               type: string
 *                               description: Task ID
 *                             authorId:
 *                               type: string
 *                               description: Author user ID
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                         description: Comments made by the user
 *             example:
 *               - id: "507f1f77bcf86cd799439011"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 image: "https://example.com/avatar.jpg"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *                 accounts:
 *                   - id: "507f1f77bcf86cd799439012"
 *                     userId: "507f1f77bcf86cd799439011"
 *                     type: "oauth"
 *                     provider: "google"
 *                     providerAccountId: "1234567890"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                 sessions:
 *                   - id: "507f1f77bcf86cd799439013"
 *                     sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     userId: "507f1f77bcf86cd799439011"
 *                     expires: "2024-02-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                 Authenticator: []
 *                 ownedBoards:
 *                   - id: "507f1f77bcf86cd799439014"
 *                     name: "My Project Board"
 *                     description: "Main project tracking"
 *                     ownerId: "507f1f77bcf86cd799439011"
 *                     createdAt: "2024-01-15T11:00:00.000Z"
 *                     updatedAt: "2024-01-15T11:00:00.000Z"
 *                 boardMembers:
 *                   - id: "507f1f77bcf86cd799439015"
 *                     role: "member"
 *                     boardId: "507f1f77bcf86cd799439016"
 *                     userId: "507f1f77bcf86cd799439011"
 *                     createdAt: "2024-01-15T12:00:00.000Z"
 *                     updatedAt: "2024-01-15T12:00:00.000Z"
 *                 assignedTasks:
 *                   - id: "507f1f77bcf86cd799439017"
 *                     title: "Complete user authentication"
 *                     description: "Implement OAuth login flow"
 *                     boardId: "507f1f77bcf86cd799439014"
 *                     columnId: "507f1f77bcf86cd799439018"
 *                     order: 1
 *                     createdAt: "2024-01-15T13:00:00.000Z"
 *                     updatedAt: "2024-01-15T13:00:00.000Z"
 *                 taskComments:
 *                   - id: "507f1f77bcf86cd799439019"
 *                     content: "Working on the Google OAuth integration"
 *                     taskId: "507f1f77bcf86cd799439017"
 *                     authorId: "507f1f77bcf86cd799439011"
 *                     createdAt: "2024-01-15T14:00:00.000Z"
 *                     updatedAt: "2024-01-15T14:00:00.000Z"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *               message: "Session missing"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch users"
 *               message: "Database connection failed"
 */

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json(
        { error: "Unauthorized", message: "Session missing" },
        { status: 401 },
      );

    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        Authenticator: true,
        ownedBoards: true,
        boardMembers: true,
        assignedTasks: true,
        taskComments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json(
      { error: "Failed to fetch users", message: (error as Error).message },
      { status: 500 },
    );
  }
}
