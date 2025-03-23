import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  evaluacion: string;
}

// Implementación como singleton para usar en las escenas de Phaser
class AuthService {
  private static instance: AuthService;
  private tokenData: TokenPayload | null = null;

  private constructor() {
    this.initializeTokenData();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeTokenData(): void {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        this.tokenData = jwtDecode<TokenPayload>(token);
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      this.tokenData = null;
    }
  }

  public getUserName(): string {
    return this.tokenData?.sub || "";
  }

  public getEvaluacionId(): string {
    return this.tokenData?.evaluacion || "";
  }

  public isAuthenticated(): boolean {
    return !!this.tokenData;
  }

  // Refresca los datos del token si ha cambiado
  public refreshTokenData(): void {
    this.initializeTokenData();
  }
}

export default AuthService;