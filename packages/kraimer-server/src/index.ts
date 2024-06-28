import express, { Request, Response } from "express";
import { exec, ExecException } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import multer from "multer";

const execAsync = promisify(exec);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Define types for our route configuration
interface ParameterConfig {
  type: "positional" | "option";
  name: string;
  httpParam: string;
  required?: boolean;
  boolean?: boolean;
  value?: any;
}

interface RouteConfig {
  response: any;
  method: "GET" | "POST" | "PUT" | "DELETE";
  command: string;
  parameters?: ParameterConfig[];
  async?: boolean;
  arguments?: { type: string; name: string; required?: boolean }[];
}

interface Config {
  routes: {
    [key: string]: RouteConfig;
  };
}

// Load route configuration
const loadRouteConfig = async (): Promise<Config> => {
  const configPath = path.join(process.cwd(), "dist/route-config.json");
  const configFile = await fs.readFile(configPath, "utf8");
  return JSON.parse(configFile);
};

// Function to validate and build command with arguments
const buildCommand = (
  command: string,
  parameters: ParameterConfig[] | undefined,
  body: any
): string => {
  let fullCommand = command;
  const errors: string[] = [];

  parameters?.forEach((param) => {
    if (param.required && !body[param.httpParam]) {
      errors.push(`Missing required parameter: ${param.httpParam}`);
    }

    if (param.type === "positional" && body[param.httpParam]) {
      fullCommand += ` ${body[param.httpParam]}`;
    } else if (param.type === "option") {
      const value = body[param.httpParam] ?? param.value;
      if (param.boolean && value) {
        fullCommand += ` -${param.name}`;
      } else if (!param.boolean && value !== undefined) {
        fullCommand += ` --${param.name}=${value}`;
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
  console.log(fullCommand, "command built");
  return fullCommand;
};

// Set up routes based on configuration
const setupRoutes = async (): Promise<void> => {
  const config = await loadRouteConfig();

  Object.entries(config.routes).forEach(([route, routeConfig]) => {
    // Convert route template to Express route
    const expressRoute = route.replace(/{(\w+)}/g, ":$1");
    console.log(`Setting up route: ${routeConfig.method} ${expressRoute}`);

    app[routeConfig.method.toLowerCase() as "get" | "post" | "put" | "delete"](
      expressRoute,
      upload.single("file"),
      async (req: Request, res: Response) => {
        console.log(
          `Received ${routeConfig.method} request for ${expressRoute}`
        );
        console.log("Request body:", req.body);
        console.log("Request params:", req.params);
        console.log("Request query:", req.query);

        try {
          let command: string;
          try {
            // Merge route params, query params, and body for parameter handling
            const allParams = { ...req.params, ...req.query, ...req.body };
            command = buildCommand(
              routeConfig.command,
              routeConfig.parameters,
              allParams
            );
          } catch (error) {
            console.error("Error building command:", error);
            return res.status(400).json({ error: (error as Error).message });
          }

          console.log("Executing command:", command);

          if (routeConfig.async) {
            // For async commands, start the process and return immediately
            exec(
              command,
              (error: ExecException | null, stdout: string, stderr: string) => {
                if (error) console.error(`Exec error: ${error}`);
                if (stderr) console.error(`Stderr: ${stderr}`);
                console.log(`Stdout: ${stdout}`);
              }
            );
            res.status(200).json({ message: "Command started" });
          } else {
            // For sync commands, wait for the result
            try {
              const { stdout, stderr } = await execAsync(command);
              console.log("Command executed successfully");
              console.log("Stdout:", stdout);
              if (stderr) console.error("Stderr:", stderr);

              if (
                routeConfig.response &&
                routeConfig.response.type === "json"
              ) {
                try {
                  const jsonResult = JSON.parse(stdout);
                  res
                    .status(200)
                    .json({ [routeConfig.response.field]: jsonResult });
                } catch (parseError) {
                  console.error("Error parsing JSON output:", parseError);
                  res
                    .status(500)
                    .json({ error: "Failed to parse command output" });
                }
              } else {
                res.status(200).send(stdout);
              }
            } catch (execError) {
              console.error(`Command execution error: ${execError}`);
              res.status(500).json({ error: "Command execution failed" });
            }
          }
        } catch (error) {
          console.error(`Unexpected error: ${error}`);
          res.status(500).json({ error: "An unexpected error occurred" });
        }
      }
    );
  });
};

// Initialize the server
const initServer = async (): Promise<void> => {
  try {
    await setupRoutes();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`Failed to initialize server: ${error}`);
    process.exit(1);
  }
};

initServer().catch(console.error);
