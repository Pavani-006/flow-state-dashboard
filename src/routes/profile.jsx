import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/store/auth-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — Flowdesk" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ customAvatar: reader.result });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Profile"
        subtitle="Manage your account settings and preferences."
      />

      <Card className="max-w-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-24 w-24 ring-4 ring-muted transition-opacity group-hover:opacity-75">
                <AvatarImage src={user?.customAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || "Pavani"}&backgroundColor=f1f5f9`} alt={user?.name || "Profile image"} />
              <AvatarFallback className="text-2xl">{user?.name?.substring(0, 2).toUpperCase() || "PA"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{user?.name || "Pavani"}</h3>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Mail className="h-3.5 w-3.5" />
                {user?.email || "pavani@example.com"}
              </p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1">
                <Shield className="h-3.5 w-3.5" />
                Standard Plan
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload New Avatar"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
