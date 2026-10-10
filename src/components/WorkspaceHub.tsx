import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  HardDrive,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCode,
  Image as ImageIcon,
  Folder,
  X,
  FileSpreadsheet,
  File,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  setAccessToken,
} from '../services/googleAuth';
import {
  listGmailMessages,
  getGmailMessageDetail,
  sendGmailEmail,
  trashGmailMessage,
  GmailMessageSummary,
  GmailMessageDetail,
} from '../services/gmailService';
import {
  listDriveFiles,
  createDriveTextFile,
  trashDriveFile,
  DriveFileSummary,
} from '../services/driveService';
import { User } from 'firebase/auth';

interface WorkspaceHubProps {
  onBack: () => void;
  onAskNova: (prompt: string) => void;
  initialTab?: 'gmail' | 'drive';
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  onBack,
  onAskNova,
  initialTab = 'gmail',
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'drive'>(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Gmail states
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessageDetail | null>(null);
  const [isLoadingEmailDetail, setIsLoadingEmailDetail] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Drive states
  const [files, setFiles] = useState<DriveFileSummary[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  // Action status notification
  const [notice, setNotice] = useState<string | null>(null);

  // Mandatory confirmation dialog for mutating operations (as per Workspace integration guidelines)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    onConfirm: async () => {},
  });

  // Track auth state with Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch emails when on Gmail tab and authenticated
  useEffect(() => {
    if (token && activeTab === 'gmail') {
      fetchEmails();
    } else if (token && activeTab === 'drive') {
      fetchFiles();
    }
  }, [token, activeTab]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNotice('Successfully connected Google Workspace (Gmail & Drive)!');
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google. Please allow popup permissions.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setEmails([]);
    setFiles([]);
    setNotice('Disconnected Google Workspace account.');
  };

  // Gmail Fetch
  const fetchEmails = async (searchQuery = emailSearch) => {
    if (!token) return;
    setIsLoadingEmails(true);
    try {
      const list = await listGmailMessages(token, searchQuery);
      setEmails(list);
    } catch (err: any) {
      console.error('Failed to load Gmail messages:', err);
      if (err.message?.includes('401') || err.message?.includes('token')) {
        setToken(null);
      }
      setNotice('Could not fetch emails. Please refresh connection.');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Gmail Open Detail
  const handleOpenEmail = async (messageId: string) => {
    if (!token) return;
    setIsLoadingEmailDetail(true);
    try {
      const detail = await getGmailMessageDetail(token, messageId);
      setSelectedEmail(detail);
    } catch (err: any) {
      setNotice(`Failed to open email: ${err?.message}`);
    } finally {
      setIsLoadingEmailDetail(false);
    }
  };

  // Send Email with User Confirmation (MANDATORY OPERATION CONFIRMATION)
  const handleRequestSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      setNotice('Please fill in recipient, subject, and body.');
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: 'Confirm Send Email via Gmail',
      description: `Are you sure you want to send this email to ${composeTo} with subject "${composeSubject}"? This will dispatch the email directly from your Gmail account.`,
      confirmLabel: 'Send Email',
      isDestructive: false,
      onConfirm: async () => {
        if (!token) return;
        try {
          await sendGmailEmail(token, {
            to: composeTo.trim(),
            subject: composeSubject.trim(),
            body: composeBody.trim(),
          });
          setIsComposeOpen(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
          setNotice('Email sent successfully via Gmail!');
          fetchEmails();
        } catch (err: any) {
          setNotice(`Failed to send email: ${err.message}`);
        }
      },
    });
  };

  // Trash Email with User Confirmation (MANDATORY OPERATION CONFIRMATION)
  const handleRequestTrashEmail = (messageId: string, subject: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Move Email to Trash?',
      description: `Are you sure you want to move the email "${subject}" to the Gmail Trash folder?`,
      confirmLabel: 'Move to Trash',
      isDestructive: true,
      onConfirm: async () => {
        if (!token) return;
        try {
          await trashGmailMessage(token, messageId);
          setEmails((prev) => prev.filter((m) => m.id !== messageId));
          if (selectedEmail?.id === messageId) setSelectedEmail(null);
          setNotice('Email moved to trash.');
        } catch (err: any) {
          setNotice(`Failed to trash email: ${err.message}`);
        }
      },
    });
  };

  // Drive Fetch
  const fetchFiles = async (searchQuery = driveSearch) => {
    if (!token) return;
    setIsLoadingFiles(true);
    try {
      const list = await listDriveFiles(token, searchQuery);
      setFiles(list);
    } catch (err: any) {
      console.error('Failed to load Google Drive files:', err);
      if (err.message?.includes('401') || err.message?.includes('token')) {
        setToken(null);
      }
      setNotice('Could not fetch Google Drive files.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Create Drive Text File with User Confirmation (MANDATORY OPERATION CONFIRMATION)
  const handleRequestCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setNotice('Please provide a file name.');
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: 'Create File in Google Drive',
      description: `Are you sure you want to create "${newFileName}" in your Google Drive root directory with the provided content?`,
      confirmLabel: 'Create File',
      isDestructive: false,
      onConfirm: async () => {
        if (!token) return;
        try {
          await createDriveTextFile(token, {
            name: newFileName.trim().endsWith('.txt') ? newFileName.trim() : `${newFileName.trim()}.txt`,
            content: newFileContent,
          });
          setIsCreateFileOpen(false);
          setNewFileName('');
          setNewFileContent('');
          setNotice('File created in Google Drive successfully!');
          fetchFiles();
        } catch (err: any) {
          setNotice(`Failed to create file: ${err.message}`);
        }
      },
    });
  };

  // Trash Drive File with User Confirmation (MANDATORY OPERATION CONFIRMATION)
  const handleRequestTrashFile = (fileId: string, fileName: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: 'Move Google Drive File to Trash?',
      description: `Are you sure you want to move "${fileName}" to Google Drive Trash?`,
      confirmLabel: 'Delete File',
      isDestructive: true,
      onConfirm: async () => {
        if (!token) return;
        try {
          await trashDriveFile(token, fileId);
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
          setNotice(`Moved "${fileName}" to trash.`);
        } catch (err: any) {
          setNotice(`Failed to trash file: ${err.message}`);
        }
      },
    });
  };

  // Helper for Drive File Icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-amber-400" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('csv'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (mimeType.includes('document') || mimeType.includes('doc'))
      return <FileText className="w-5 h-5 text-blue-400" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-400" />;
    if (mimeType.includes('code') || mimeType.includes('json') || mimeType.includes('javascript'))
      return <FileCode className="w-5 h-5 text-cyan-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide uppercase flex items-center space-x-2">
              <span>Google Workspace</span>
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ff1e38]" />
            </h1>
            <p className="text-xs text-slate-400">Gmail & Google Drive Neural Integration</p>
          </div>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
            title="Disconnect Google account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="mt-3 p-3 rounded-xl bg-[#14141e] border border-red-500/30 text-xs text-slate-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Authentication Banner / Official Sign In with Google Button */}
      {!token ? (
        <div className="my-5 p-6 rounded-2xl bg-[#14141e] border border-white/10 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <svg className="w-8 h-8" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white mb-1">
            Connect Gmail & Google Drive
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mb-5 leading-relaxed">
            Authorize NOVA AI to browse your inbox, search Drive files, compose replies, and analyze documents with end-to-end user confirmation.
          </p>

          {authError && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {authError}
            </div>
          )}

          {/* Official Google Material Button Style as required by skill */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="flex items-center justify-center space-x-3 px-5 py-3 rounded-full bg-white text-slate-800 font-semibold text-xs tracking-tight shadow-lg hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>
      ) : (
        /* Connected User Profile Banner */
        <div className="my-3 p-3 rounded-2xl bg-[#14141e] border border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'G'}
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-white truncate max-w-[200px]">
                {user?.displayName || 'Google User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {user?.email}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            Connected
          </span>
        </div>
      )}

      {/* Tabs: Gmail vs Google Drive */}
      {token && (
        <>
          <div className="grid grid-cols-2 gap-2 my-2">
            <button
              onClick={() => setActiveTab('gmail')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'gmail'
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(255,30,56,0.5)]'
                  : 'bg-[#14141e] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Gmail ({emails.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'drive'
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(255,30,56,0.5)]'
                  : 'bg-[#14141e] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Google Drive ({files.length})</span>
            </button>
          </div>

          {/* GMAIL TAB CONTENT */}
          {activeTab === 'gmail' && (
            <div className="mt-2 space-y-3">
              {/* Search & Actions Bar */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
                    placeholder="Search messages..."
                    className="w-full bg-[#14141e] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  onClick={() => fetchEmails()}
                  disabled={isLoadingEmails}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                  title="Refresh emails"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsComposeOpen(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Compose</span>
                </button>
              </div>

              {/* Message List */}
              {isLoadingEmails ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
                  <span>Syncing with Gmail...</span>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#14141e] rounded-2xl border border-white/5">
                  No messages found. Try a different search or compose a new email.
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => handleOpenEmail(msg.id)}
                      className="p-3.5 rounded-2xl bg-[#14141e] border border-white/5 hover:border-red-500/40 cursor-pointer transition-all active:scale-[0.99] group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white truncate max-w-[200px]">
                          {msg.from.replace(/<.*>/, '').trim() || msg.from}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-red-400 transition-colors truncate">
                        {msg.subject}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {msg.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GOOGLE DRIVE TAB CONTENT */}
          {activeTab === 'drive' && (
            <div className="mt-2 space-y-3">
              {/* Search & Actions Bar */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={driveSearch}
                    onChange={(e) => setDriveSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                    placeholder="Search Google Drive..."
                    className="w-full bg-[#14141e] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  onClick={() => fetchFiles()}
                  disabled={isLoadingFiles}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                  title="Refresh files"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsCreateFileOpen(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
              </div>

              {/* Files List */}
              {isLoadingFiles ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
                  <span>Loading Google Drive files...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#14141e] rounded-2xl border border-white/5">
                  No files found in Google Drive matching query.
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5 hover:border-red-500/40 transition-all group"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2 font-mono">
                            {file.size && <span>{file.size}</span>}
                            <span>•</span>
                            <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* File Actions */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Ask NOVA to analyze file */}
                        <button
                          onClick={() => {
                            onAskNova(
                              `I need you to inspect this Google Drive file: "${file.name}" (Type: ${file.mimeType}). Provide insights on its context and suggested operations.`
                            );
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                          title="Ask NOVA AI about this file"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Open in Drive link */}
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Trash file */}
                        <button
                          onClick={() => handleRequestTrashFile(file.id, file.name)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                          title="Move to trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* DETAIL MODAL: VIEW GMAIL MESSAGE */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#13131c] border border-white/15 rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col animate-slideUp">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="min-w-0 pr-3">
                <h3 className="text-sm font-bold text-white leading-tight">
                  {selectedEmail.subject}
                </h3>
                <div className="text-xs text-slate-400 mt-1">
                  From: <span className="text-slate-200">{selectedEmail.from}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {selectedEmail.date}
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto py-4 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedEmail.bodyText}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  const subject = selectedEmail.subject;
                  const body = selectedEmail.bodyText.slice(0, 800);
                  setSelectedEmail(null);
                  onAskNova(
                    `Please read and summarize this email:\nSubject: ${subject}\n\n${body}`
                  );
                }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summarize with NOVA</span>
              </button>

              <button
                onClick={() => handleRequestTrashEmail(selectedEmail.id, selectedEmail.subject)}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-medium border border-red-500/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSE EMAIL MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#13131c] border border-white/15 rounded-3xl p-5 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Mail className="w-4 h-4 text-red-500" />
                <span>Compose New Email (Gmail)</span>
              </h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSendEmail} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Recipient (To)
                </label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Meeting update, project summary..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={5}
                  required
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Help me draft a concise email to ${composeTo || 'a colleague'} about "${composeSubject || 'a project update'}".`;
                    setIsComposeOpen(false);
                    onAskNova(prompt);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft with NOVA AI</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DRIVE NOTE MODAL */}
      {isCreateFileOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#13131c] border border-white/15 rounded-3xl p-5 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-red-500" />
                <span>Create New Google Drive Note</span>
              </h3>
              <button
                onClick={() => setIsCreateFileOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestCreateFile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. Project Notes 2026.txt"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  File Content
                </label>
                <textarea
                  rows={5}
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="Write note contents..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateFileOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow"
                >
                  <span>Save to Drive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR ALL MUTATING OPERATIONS */}
      {confirmationDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#181824] border border-red-500/40 rounded-3xl p-5 shadow-2xl text-left">
            <div className="flex items-center space-x-2.5 text-red-400 font-bold text-sm mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{confirmationDialog.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {confirmationDialog.description}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setConfirmationDialog((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const action = confirmationDialog.onConfirm;
                  setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
                  await action();
                }}
                className={`flex-1 py-2 rounded-xl text-white text-xs font-semibold shadow transition-colors ${
                  confirmationDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {confirmationDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
