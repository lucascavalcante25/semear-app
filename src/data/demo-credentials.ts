export type DemoCredential = {
  name: string;
  email: string;
  role: string;
  password: string;
};

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    name: "Administração",
    email: "admin@semear.com",
    role: "admin",
    password: "admin123",
  },
  {
    name: "Pastor",
    email: "pastor@semear.com",
    role: "pastor",
    password: "pastor123",
  },
  {
    name: "Secretaria",
    email: "secretaria@semear.com",
    role: "secretaria",
    password: "secret123",
  },
  {
    name: "Tesouraria",
    email: "tesouraria@semear.com",
    role: "tesouraria",
    password: "tesouro123",
  },
  {
    name: "Liderança",
    email: "lider@semear.com",
    role: "lider",
    password: "lider123",
  },
  {
    name: "Membro",
    email: "membro@semear.com",
    role: "membro",
    password: "membro123",
  },
  {
    name: "Visitante",
    email: "visitante@semear.com",
    role: "visitante",
    password: "visitante123",
  },
];
