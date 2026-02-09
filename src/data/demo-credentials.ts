export type DemoCredential = {
  name: string;
  email: string;
  role: string;
  password: string;
};

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    name: "Administração",
    email: "admin@semeare.com",
    role: "admin",
    password: "admin123",
  },
  {
    name: "Pastor",
    email: "pastor@semeare.com",
    role: "pastor",
    password: "pastor123",
  },
  {
    name: "Secretaria",
    email: "secretaria@semeare.com",
    role: "secretaria",
    password: "secret123",
  },
  {
    name: "Tesouraria",
    email: "tesouraria@semeare.com",
    role: "tesouraria",
    password: "tesouro123",
  },
  {
    name: "Liderança",
    email: "lider@semeare.com",
    role: "lider",
    password: "lider123",
  },
  {
    name: "Membro",
    email: "membro@semeare.com",
    role: "membro",
    password: "membro123",
  },
  {
    name: "Visitante",
    email: "visitante@semeare.com",
    role: "visitante",
    password: "visitante123",
  },
];
