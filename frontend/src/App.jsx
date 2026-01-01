import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthMain from "./pages/Auth/AuthMain";
import Home from "./pages/Home/HomeMain";
import Admin from "./components/Admin";
import ChangePassword from "./pages/Auth/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import RegOTP from "./pages/Auth/RegOTP";
import PageNotFound from "./pages/404Page/PageNotFound";
import UserChat from "./pages/chat/UserChat";
import HelpSupport from "./pages/Help/HelpAndSupport";
import ChatHistoryPage from "./pages/chat/ChatHistory";
import CreateAgent from "./pages/agents/CreateAgent";
import AgentsList from "./pages/agents/AgentsList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthMain />} />

        <Route path="/reg-otp" element={<RegOTP />} />
        <Route
          path="/"
          element={
            <ProtectedRoute role="user">
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <AgentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/create"
          element={
            <ProtectedRoute>
              <CreateAgent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:agentId"
          element={
            <ProtectedRoute>
              <UserChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-chat"
          element={
            <ProtectedRoute role="user|admin">
              <UserChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chathistory"
          element={
            <ProtectedRoute>
              <ChatHistoryPage />
            </ProtectedRoute>
          }
        />
        

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help-support"
          element={
            <ProtectedRoute>
              <HelpSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
