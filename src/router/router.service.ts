import { Application, Router } from 'express';
import RouteEngine from './router-engine';
import authRouter from '../components/auth/auth.router';
import docsRouter from '../components/docs/router';
import config from '../config/config';
import userRouter from '../components/user/user.router';

class RouteService {
  private app: Application;
  private router: RouteEngine;
  public constructor(app: Application) {
    this.app = app;
    this.router = new RouteEngine();
    this.bindRouters();
  }

  public bindRouters() {
    this.router.registerRouter('/api/v1/auth/', authRouter);
    if (config.env === 'development') {
      this.router.registerRouter('/api/v1/docs', docsRouter);
    }
    this.router.registerRouter('/api/v1/users/', userRouter);
  }

  public run() {
    this.router.getRouters().forEach((router: Router, routeName: string) => {
      this.app.use(routeName, router);
    });
  }
}

export default RouteService;
