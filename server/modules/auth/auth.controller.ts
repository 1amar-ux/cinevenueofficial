import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

export class AuthController {
  private setSessionCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const secure = process.env.NODE_ENV === "production";
    const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
    res.cookie("cine_access_token", tokens.accessToken, { ...base, maxAge: 60 * 60 * 1000 });
    res.cookie("cine_refresh_token", tokens.refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      this.setSessionCookies(res, result.tokens);
      return res.status(201).json({
        success: true,
        message: "Your account has been created. Please verify your email address to continue.",
        data: { user: result.user, verificationToken: result.verificationToken }
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      this.setSessionCookies(res, result.tokens);
      return res.json({
        success: true,
        message: "Login successful",
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = String(req.query.token || "");
      const result = await authService.verifyEmail(token);
      return res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  public async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resendVerification(String(req.body?.email || ""));
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async googleLoginRedirect(req: Request, res: Response, next: NextFunction) {
    try {
      const redirectUrl = await authService.getGoogleAuthRedirectUrl();
      return res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  public async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, code, state, email, name, image } = req.body || {};
      const result = await authService.googleLogin({ idToken, code, state, email, name, image });
      this.setSessionCookies(res, result.tokens);
      return res.json({
        success: true,
        message: "Google authentication successful",
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith("cine_refresh_token="))?.split("=")[1];
      const tokens = await authService.refreshToken(refreshToken);
      this.setSessionCookies(res, tokens);
      return res.json({
        success: true,
        message: "Session refreshed successfully",
        data: {}
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith("cine_refresh_token="))?.split("=")[1];
      const result = await authService.logout(refreshToken);
      res.clearCookie("cine_access_token", { path: "/" });
      res.clearCookie("cine_refresh_token", { path: "/" });
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      return res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
