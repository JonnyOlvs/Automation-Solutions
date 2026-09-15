import { GithubWorkflowRun, Integration } from "../../types";

/**
 * Contrato desacoplado para la integracion con GitHub. Hoy se implementa con
 * datos simulados (MockGithubProvider). Cuando se conecte GitHub de verdad,
 * se agrega OctokitGithubProvider con esta misma interfaz (usando un token
 * guardado unicamente en el backend, nunca en el frontend) y ninguna ruta
 * ni pantalla del dashboard necesita cambiar.
 */
export interface GithubProvider {
  getRepository(repoFullName: string): Promise<{ fullName: string; defaultBranch: string; url: string }>;
  getLastWorkflowRun(repoFullName: string): Promise<GithubWorkflowRun>;
}

export class MockGithubProvider implements GithubProvider {
  async getRepository(repoFullName: string) {
    return {
      fullName: repoFullName,
      defaultBranch: "main",
      url: `https://github.com/${repoFullName}`
    };
  }

  async getLastWorkflowRun(repoFullName: string): Promise<GithubWorkflowRun> {
    return {
      id: "run-simulado",
      workflow: "automation.yml",
      status: "success",
      branch: "main",
      actor: "ci-runner"
    };
  }
}

export function describeIntegrationStatus(integration: Integration): string {
  if (!integration.connected) return "Sin conectar";
  return integration.lastWorkflowRun.status;
}
