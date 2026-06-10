import React, { useState } from "react";
import { ArrowRight, Mail, Lock, User, AlertCircle } from "lucide-react";
import {
  auth,
  googleProvider,
  db,
  handleFirestoreError,
  OperationType,
  isRemixed,
} from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const saveUserToFirestore = async (user: any, nameStr: string) => {
    if (isRemixed) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email || "",
          name: nameStr || user.displayName || "Utilizador",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.warn("Could not save user to DB, continuing anyway", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRemixed || auth.isDummy) {
      // Mock login explicitly to let user proceed without errors in a remixed app
      onComplete();
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onComplete();
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await saveUserToFirestore(userCred.user, name);
        onComplete();
      }
    } catch (err: any) {
      console.warn("Login failed", err);
      if (err.code === "auth/operation-not-allowed") {
        setError(
          "O login com Email/Senha não está ativado neste projeto. Por favor, use o Google ou ative no console do Firebase.",
        );
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Email ou senha inválidos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este email já está em uso.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(err.message || "Ocorreu um erro.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isRemixed || auth.isDummy || !googleProvider) {
      // Mock google login explicitly to let user proceed without errors in a remixed app
      onComplete();
      return;
    }
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user, result.user.displayName || "");
      onComplete();
    } catch (err: any) {
      console.warn("Google login failed", err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        setError(
          "Popup bloqueado ou cancelado. Por favor, permita popups para este site (ou abra o aplicativo em uma nova guia)."
        );
      } else {
        setError(err.message || "Erro ao fazer login com o Google.");
      }
    } finally {
      if (typeof setLoading === 'function') setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f13] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #2dd4bf 0%, transparent 20%)",
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="bg-[#16161a] border border-[#2d2d33] rounded-2xl w-full max-w-md p-8 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20 p-2">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-white"
              fill="currentColor"
            >
              <path
                d="M 50 25 L 75 70"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 37.5 47.5 L 75 70"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="50" cy="25" r="12" />
              <circle cx="75" cy="70" r="12" />
              <circle cx="25" cy="70" r="12" />
              <circle cx="37.5" cy="47.5" r="6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            AllvaTronics
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Design Profissional de Circuitos & PCB
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mb-6 shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar com Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-[#2d2d33]"></div>
          <span className="mx-4 text-xs text-gray-500">ou</span>
          <div className="flex-grow border-t border-[#2d2d33]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f0f13] border border-[#2d2d33] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0f0f13] border border-[#2d2d33] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0f0f13] border border-[#2d2d33] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-teal-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-6 shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar Conta"}{" "}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={async () => {
              try {
                if (isRemixed || auth.isDummy) {
                  onComplete();
                  return;
                }
                setLoading(true);
                await signInAnonymously(auth);
                onComplete();
              } catch (err: any) {
                console.warn("Guest login fallback: ", err);
                if (err.code === "auth/operation-not-allowed") {
                  setError(
                    "O login como Convidado (Anônimo) não está ativado no Firebase. Use o Google ou ative o login anônimo no console do Firebase.",
                  );
                } else {
                  setError(err.message || "Erro ao entrar como convidado.");
                }
                setLoading(false);
              }
            }}
            disabled={loading}
            className="text-gray-400 hover:text-white transition font-medium text-xs mb-4"
          >
            Continuar como Convidado (Sem Login)
          </button>
        </div>

        <div className="text-center pt-4 border-t border-[#2d2d33]">
          <p className="text-xs text-gray-500">
            {isLogin ? "Não possui uma conta? " : "Já possui uma conta? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-teal-500 hover:text-teal-400 transition font-medium"
            >
              {isLogin ? "Cadastrar-se" : "Fazer Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
