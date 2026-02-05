/**
 * Render Workflow
 *
 * Uses the Render SDK to orchestrate multi-step workflows.
 * See: https://github.com/render-oss/sdk
 */

import "dotenv/config";
import Render from "@renderinc/sdk";

// Initialize Render SDK
const render = new Render({
  apiKey: process.env.RENDER_API_KEY,
});

/**
 * Example workflow: Deploy and notify
 */
async function deployWorkflow(): Promise<void> {
  console.log("Starting deployment workflow...");

  // TODO: Customize your workflow steps
  // The Render SDK provides access to:
  // - Services management
  // - Deployments
  // - Environment variables
  // - Logs and metrics

  try {
    // Example: List services
    const services = await render.services.list();
    console.log(`Found ${services.length} services`);

    // Example: Trigger a deploy (uncomment and customize)
    // const deployment = await render.deploys.create({
    //   serviceId: 'srv-xxxxx',
    // });
    // console.log(`Deployment triggered: ${deployment.id}`);

    console.log("Workflow completed successfully");
  } catch (error) {
    console.error("Workflow failed:", error);
    throw error;
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  if (!process.env.RENDER_API_KEY) {
    console.warn("RENDER_API_KEY not set - workflow will run in demo mode");
  }

  await deployWorkflow();
}

// Run the workflow
main()
  .then(() => {
    console.log("Workflow exiting successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Workflow exiting with error:", error);
    process.exit(1);
  });
