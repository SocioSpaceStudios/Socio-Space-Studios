
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useSearchParams } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Globe, 
  Lock, 
  Upload, 
  Instagram, 
  Youtube, 
  Video, 
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateUser, theme, toggleTheme, showToast } = useData();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'integrations' | 'security' | 'notifications'>('profile');
  
  // Profile Form State
  const [profileData, setProfileData] = useState({ 
    name: user.name, 
    email: user.email, 
    niche: user.niche || '', 
    bio: user.bio || '' 
  });
  
  // Notification State
  const [notifications, setNotifications] = useState({
    emailMarketing: true,
    jobAlerts: true,
    paymentAlerts: true,
    securityAlerts: true
  });

  // Handle URL params for direct linking
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'billing', 'integrations', 'security', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const handleProfileSave = () => {
    updateUser(profileData);
    showToast('Profile updated successfully');
  };

  const toggleConnection = (platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter') => {
    if (user.connectedAccounts) {
      updateUser({
        connectedAccounts: {
          ...user.connectedAccounts,
          [platform]: !user.connectedAccounts[platform]
        }
      });
      showToast(`${user.connectedAccounts[platform] ? 'Disconnected' : 'Connected'} ${platform}`);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left
        ${activeTab === id 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'text-textMuted hover:bg-surfaceLight hover:text-textMain'
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)]">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
        <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-4 px-4">Account</h3>
        <SidebarItem id="profile" icon={User} label="General Profile" />
        <SidebarItem id="integrations" icon={Globe} label="Connected Apps" />
        <SidebarItem id="billing" icon={CreditCard} label="Billing & Plans" />
        <SidebarItem id="notifications" icon={Bell} label="Notifications" />
        <SidebarItem id="security" icon={Shield} label="Security" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface border border-borderColor rounded-xl p-6 lg:p-8 shadow-sm h-fit">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">General Profile</h2>
              <p className="text-textMuted text-sm">Manage your personal information and creator details.</p>
            </div>

            <div className="flex items-start gap-6 pb-8 border-b border-borderColor">
               <div className="relative group cursor-pointer">
                  <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-md" />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Upload className="text-white" size={24} />
                  </div>
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-textMain text-lg">{user.name}</h3>
                 <p className="text-textMuted text-sm mb-4">Pro Creator • {user.niche}</p>
                 <div className="flex gap-3">
                   <button className="px-4 py-2 bg-surfaceLight border border-borderColor rounded-lg text-sm font-medium hover:bg-surfaceLight/80 transition-colors">
                     Change Avatar
                   </button>
                   <button className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors">
                     Remove
                   </button>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-textMain">Display Name</label>
                 <input 
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" 
                  />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-textMain">Email Address</label>
                 <input 
                    value={profileData.email}
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" 
                  />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-textMain">Niche / Industry</label>
                 <input 
                    value={profileData.niche}
                    onChange={e => setProfileData({...profileData, niche: e.target.value})}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" 
                  />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-sm font-medium text-textMain">Bio</label>
                 <textarea 
                    rows={4}
                    value={profileData.bio}
                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full bg-surfaceLight border border-borderColor rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain resize-none" 
                  />
                  <p className="text-xs text-textMuted text-right">Brief description for your media kit.</p>
               </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-borderColor">
              <button 
                onClick={handleProfileSave}
                className="px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md flex items-center gap-2 bg-primary hover:bg-primaryHover"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">Connected Accounts</h2>
              <p className="text-textMuted text-sm">Connect your social platforms to sync analytics.</p>
            </div>

            <div className="space-y-4">
               {/* Instagram */}
               <div className="flex items-center justify-between p-4 border border-borderColor rounded-xl hover:bg-surfaceLight/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg text-white">
                        <Instagram size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-textMain">Instagram</h4>
                        <p className="text-xs text-textMuted">Sync posts, reels, and engagement stats.</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => toggleConnection('instagram')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                      ${user.connectedAccounts?.instagram 
                        ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'bg-primary text-white border-transparent hover:bg-primaryHover'}`}
                  >
                    {user.connectedAccounts?.instagram ? 'Disconnect' : 'Connect'}
                  </button>
               </div>

               {/* TikTok */}
               <div className="flex items-center justify-between p-4 border border-borderColor rounded-xl hover:bg-surfaceLight/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-black rounded-lg text-white dark:bg-white dark:text-black">
                        <Video size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-textMain">TikTok</h4>
                        <p className="text-xs text-textMuted">Import video views and follower growth.</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => toggleConnection('tiktok')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                      ${user.connectedAccounts?.tiktok 
                        ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'bg-primary text-white border-transparent hover:bg-primaryHover'}`}
                  >
                    {user.connectedAccounts?.tiktok ? 'Disconnect' : 'Connect'}
                  </button>
               </div>

               {/* YouTube */}
               <div className="flex items-center justify-between p-4 border border-borderColor rounded-xl hover:bg-surfaceLight/30 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-red-600 rounded-lg text-white">
                        <Youtube size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-textMain">YouTube</h4>
                        <p className="text-xs text-textMuted">Track subscribers and video revenue.</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => toggleConnection('youtube')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                      ${user.connectedAccounts?.youtube 
                        ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : 'bg-primary text-white border-transparent hover:bg-primaryHover'}`}
                  >
                    {user.connectedAccounts?.youtube ? 'Disconnect' : 'Connect'}
                  </button>
               </div>
            </div>
           </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">Billing & Plans</h2>
              <p className="text-textMuted text-sm">Manage your subscription and payment methods.</p>
            </div>

            <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-2xl text-white shadow-lg">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Current Plan</p>
                    <h3 className="text-3xl font-bold">Pro Creator</h3>
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">ACTIVE</span>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                     <p className="text-2xl font-bold">$29<span className="text-sm text-white/70 font-normal">/month</span></p>
                     <p className="text-xs text-white/70 mt-1">Renews on June 1, 2024</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-primary font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                     Manage Subscription
                  </button>
               </div>
            </div>

            <div>
               <h4 className="font-bold text-textMain mb-4 flex items-center gap-2">
                 <CreditCard size={18} className="text-primary" /> Payment Method
               </h4>
               <div className="p-4 border border-borderColor rounded-xl flex justify-between items-center bg-surfaceLight/20">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-8 bg-surface border border-borderColor rounded flex items-center justify-center">
                       <span className="font-bold text-xs italic text-blue-800">VISA</span>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-textMain">Visa ending in 4242</p>
                        <p className="text-xs text-textMuted">Expiry 12/2025</p>
                     </div>
                  </div>
                  <button className="text-sm text-primary font-medium hover:underline">Update</button>
               </div>
            </div>

            <div>
               <h4 className="font-bold text-textMain mb-4">Invoice History</h4>
               <div className="border border-borderColor rounded-xl overflow-hidden">
                  {[1,2,3].map((i) => (
                     <div key={i} className="flex justify-between items-center p-4 border-b border-borderColor last:border-0 hover:bg-surfaceLight/30">
                        <div>
                           <p className="text-sm font-medium text-textMain">Invoice #{1000 + i} - Pro Plan</p>
                           <p className="text-xs text-textMuted">May {10 - i}, 2024</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-sm font-bold text-textMain">$29.00</span>
                           <button className="text-xs text-primary hover:underline">Download</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">Notifications</h2>
              <p className="text-textMuted text-sm">Choose what we can contact you about.</p>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between pb-4 border-b border-borderColor">
                  <div>
                     <h4 className="font-bold text-textMain text-sm">Email Marketing</h4>
                     <p className="text-xs text-textMuted mt-1">Receive tips, trends, and product updates.</p>
                  </div>
                  <div 
                    onClick={() => setNotifications({...notifications, emailMarketing: !notifications.emailMarketing})}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.emailMarketing ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.emailMarketing ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
               
               <div className="flex items-center justify-between pb-4 border-b border-borderColor">
                  <div>
                     <h4 className="font-bold text-textMain text-sm">Job Alerts</h4>
                     <p className="text-xs text-textMuted mt-1">Get notified when brands accept your applications.</p>
                  </div>
                  <div 
                    onClick={() => setNotifications({...notifications, jobAlerts: !notifications.jobAlerts})}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.jobAlerts ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.jobAlerts ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>

               <div className="flex items-center justify-between pb-4 border-b border-borderColor">
                  <div>
                     <h4 className="font-bold text-textMain text-sm">Payment Alerts</h4>
                     <p className="text-xs text-textMuted mt-1">Notifications for paid invoices and expenses.</p>
                  </div>
                  <div 
                    onClick={() => setNotifications({...notifications, paymentAlerts: !notifications.paymentAlerts})}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.paymentAlerts ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.paymentAlerts ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
            </div>

            <div className="bg-surfaceLight/30 p-4 rounded-xl border border-borderColor">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-textMain">Interface Theme</span>
                  <button 
                     onClick={toggleTheme}
                     className="px-3 py-1.5 bg-surface border border-borderColor rounded-lg text-xs font-medium text-textMain hover:bg-surfaceLight transition-colors"
                  >
                     {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </button>
               </div>
               <p className="text-xs text-textMuted">Customize the look and feel of your dashboard.</p>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <h2 className="text-2xl font-bold text-textMain mb-1">Security</h2>
              <p className="text-textMuted text-sm">Update password and manage account security.</p>
            </div>

            <div className="space-y-4 max-w-md">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-textMain">Current Password</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                   <input 
                      type="password"
                      className="w-full bg-surfaceLight border border-borderColor rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" 
                      placeholder="••••••••"
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-textMain">New Password</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                   <input 
                      type="password"
                      className="w-full bg-surfaceLight border border-borderColor rounded-lg pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-primary text-textMain" 
                      placeholder="••••••••"
                   />
                 </div>
               </div>
               <button className="px-4 py-2 bg-surfaceLight border border-borderColor rounded-lg text-sm font-medium hover:bg-surface hover:text-primary transition-colors">
                  Update Password
               </button>
            </div>

            <div className="pt-8 border-t border-borderColor">
               <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                 <Shield size={18} /> Danger Zone
               </h3>
               <div className="border border-red-200 dark:border-red-900/30 rounded-xl p-4 bg-red-50 dark:bg-red-900/10 flex justify-between items-center">
                  <div>
                     <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Delete Account</h4>
                     <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                        Permanently delete your account and all data.
                     </p>
                  </div>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
                     Delete Account
                  </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
