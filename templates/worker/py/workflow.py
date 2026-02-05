"""
Render Workflow

Uses the Render SDK to orchestrate multi-step workflows.
See: https://pypi.org/project/render-sdk/
"""

import os
import sys

from dotenv import load_dotenv

load_dotenv()

# Check for render-sdk availability
try:
    import render
except ImportError:
    print("render-sdk not installed. Run: pip install render-sdk")
    sys.exit(1)


def deploy_workflow() -> None:
    """Example workflow: Deploy and notify."""
    print("Starting deployment workflow...")

    api_key = os.getenv("RENDER_API_KEY")

    if not api_key:
        print("RENDER_API_KEY not set - workflow will run in demo mode")
        print("Workflow completed (demo mode)")
        return

    # Initialize Render client
    client = render.Render(api_key=api_key)

    try:
        # TODO: Customize your workflow steps
        # The Render SDK provides access to:
        # - Services management
        # - Deployments
        # - Environment variables
        # - Logs and metrics

        # Example: List services
        services = client.services.list()
        print(f"Found {len(services)} services")

        # Example: Trigger a deploy (uncomment and customize)
        # deployment = client.deploys.create(service_id="srv-xxxxx")
        # print(f"Deployment triggered: {deployment.id}")

        print("Workflow completed successfully")

    except Exception as e:
        print(f"Workflow failed: {e}")
        raise


def main() -> None:
    """Main entry point."""
    deploy_workflow()


if __name__ == "__main__":
    try:
        main()
        print("Workflow exiting successfully")
        sys.exit(0)
    except Exception as e:
        print(f"Workflow exiting with error: {e}")
        sys.exit(1)
