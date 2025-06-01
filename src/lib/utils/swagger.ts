import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ProjectFlow API Documentation",
        version: "1.0",
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === "production"
              ? "https://project-management-board-nine.vercel.app"
              : "http://localhost:3000",
          description:
            process.env.NODE_ENV === "production"
              ? "Production"
              : "Development",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              error: {
                type: "string",
                description: "Error type",
              },
              message: {
                type: "string",
                description: "Error message",
              },
            },
            required: ["error", "message"],
          },
          ValidationError: {
            type: "object",
            properties: {
              error: {
                type: "string",
                description: "Error type",
              },
              message: {
                type: "object",
                description: "Validation error details",
              },
            },
            required: ["error", "message"],
          },
          CreateBoardRequest: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Board name",
                example: "My Project Board",
              },
              description: {
                type: "string",
                description: "Board description (optional)",
                example: "A board for managing project tasks",
              },
            },
            required: ["name"],
          },
          User: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "User ID (MongoDB ObjectId)",
              },
              name: {
                type: "string",
                nullable: true,
                description: "User name",
              },
              email: {
                type: "string",
                nullable: true,
                description: "User email",
              },
              image: {
                type: "string",
                nullable: true,
                description: "User profile image URL",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "User creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "User last update timestamp",
              },
            },
            required: ["id", "createdAt", "updatedAt"],
          },
          Task: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Task ID (MongoDB ObjectId)",
              },
              title: {
                type: "string",
                description: "Task title",
              },
              description: {
                type: "string",
                nullable: true,
                description: "Task description",
              },
              boardId: {
                type: "string",
                description: "Board ID where task belongs",
              },
              columnId: {
                type: "string",
                description: "Board column ID where task belongs",
              },
              assigneeId: {
                type: "string",
                nullable: true,
                description: "User ID of task assignee",
              },
              order: {
                type: "integer",
                description: "Task order in column",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Task creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Task last update timestamp",
              },
              assignee: {
                $ref: "#/components/schemas/User",
                nullable: true,
                description: "Task assignee user",
              },
            },
            required: [
              "id",
              "title",
              "boardId",
              "columnId",
              "order",
              "createdAt",
              "updatedAt",
            ],
          },
          BoardColumn: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Column ID (MongoDB ObjectId)",
              },
              columnId: {
                type: "string",
                enum: ["todo", "in_progress", "done"],
                description: "Column identifier",
              },
              title: {
                type: "string",
                enum: ["To_Do", "In_Progress", "Done"],
                description: "Column title",
              },
              color: {
                type: "string",
                enum: ["Red", "Orange", "Green"],
                description:
                  "Column color (Red: #ef4444, Orange: #f59e0b, Green: #10b981)",
              },
              order: {
                type: "integer",
                description: "Column order in board",
              },
              boardId: {
                type: "string",
                description: "Board ID",
              },
              tasks: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Task",
                },
                description: "Tasks in this column",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Column creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Column last update timestamp",
              },
            },
            required: [
              "id",
              "columnId",
              "title",
              "color",
              "order",
              "boardId",
              "createdAt",
              "updatedAt",
            ],
          },
          BoardMember: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Member ID (MongoDB ObjectId)",
              },
              role: {
                type: "string",
                default: "member",
                description: "Member role in the board",
                example: "member",
              },
              boardId: {
                type: "string",
                description: "Board ID",
              },
              userId: {
                type: "string",
                description: "User ID",
              },
              user: {
                $ref: "#/components/schemas/User",
                description: "User information",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Member join timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Member last update timestamp",
              },
            },
            required: [
              "id",
              "role",
              "boardId",
              "userId",
              "createdAt",
              "updatedAt",
            ],
          },
          Board: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Board ID (MongoDB ObjectId)",
              },
              name: {
                type: "string",
                description: "Board name",
              },
              description: {
                type: "string",
                nullable: true,
                description: "Board description",
              },
              ownerId: {
                type: "string",
                description: "Board owner user ID",
              },
              owner: {
                $ref: "#/components/schemas/User",
                description: "Board owner information",
              },
              columns: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/BoardColumn",
                },
                description: "Board columns",
              },
              tasks: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Task",
                },
                description: "All tasks in the board",
              },
              members: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/BoardMember",
                },
                description: "Board members",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Board creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Board last update timestamp",
              },
            },
            required: ["id", "name", "ownerId", "createdAt", "updatedAt"],
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
