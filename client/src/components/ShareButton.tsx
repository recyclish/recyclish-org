import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Facebook, Twitter, Linkedin, Mail, Link2, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  facilityName: string;
  facilityAddress: string;
  facilityCategory?: string;
  className?: string;
}

export function ShareButton({ 
  facilityName, 
  facilityAddress, 
  facilityCategory,
  className 
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Generate a shareable URL with facility info encoded
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      search: facilityName,
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const shareText = `Check out ${facilityName} - a ${facilityCategory || 'recycling'} facility at ${facilityAddress}. Find more recycling locations at the National Recycling Directory!`;
  const shareUrl = getShareUrl();

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Recycling Location: ${facilityName}`);
    const body = encodeURIComponent(
      `I found this recycling facility that might be useful:\n\n` +
      `${facilityName}\n` +
      `${facilityCategory ? `Category: ${facilityCategory}\n` : ''}` +
      `Address: ${facilityAddress}\n\n` +
      `View it on the National Recycling Directory:\n${shareUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Try native share API first on mobile
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: facilityName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - silently ignore
      }
    }
  };

  // Check if native share is available (mobile devices)
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 text-muted-foreground hover:text-primary ${className || ''}`}
          title="Share this facility"
          onClick={(e) => {
            e.stopPropagation();
            // On mobile, try native share first
            if (hasNativeShare) {
              handleNativeShare();
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedInShare} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2]" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
