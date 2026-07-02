"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/DashboardShell";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { categories } from "@/lib/constants";
import { createPost, getPosts, addComment, likePost, getLeaderboard } from "@/actions/community";
import {
  Users,
  MessageSquare,
  Trophy,
  ThumbsUp,
  Send,
  PlusCircle,
  Hash,
  Loader2,
  Medal,
  Award,
} from "lucide-react";

export default function CommunityPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loadingPosts, setLoadingPosts] = React.useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = React.useState(true);
  const [posts, setPosts] = React.useState<any[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [postTitle, setPostTitle] = React.useState("");
  const [postContent, setPostContent] = React.useState("");
  const [postCategory, setPostCategory] = React.useState("General");
  const [postCareerPath, setPostCareerPath] = React.useState("All");
  const [submittingPost, setSubmittingPost] = React.useState(false);

  // Comments temporary state
  const [activeCommentsText, setActiveCommentsText] = React.useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = React.useState<string | null>(null);

  const userId = session?.user ? (session.user as any).id : null;

  const loadPostsData = React.useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await getPosts();
      if (res.success) {
        setPosts(res.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadLeaderboardData = React.useCallback(async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await getLeaderboard();
      if (res.success) {
        setLeaderboard(res.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  React.useEffect(() => {
    loadPostsData();
    loadLeaderboardData();
  }, [loadPostsData, loadLeaderboardData]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) {
      toast({ description: "Please enter a title and content.", variant: "destructive" });
      return;
    }

    setSubmittingPost(true);
    try {
      const pathTag = postCareerPath === "All" ? null : postCareerPath;
      const res = await createPost(userId, postTitle, postContent, postCategory, pathTag);
      if (res.success) {
        toast({ title: "Post Published", description: "Your post is now active on the forum.", variant: "success" });
        setIsDialogOpen(false);
        setPostTitle("");
        setPostContent("");
        loadPostsData();
      }
    } catch (err) {
      toast({ description: "Error saving post.", variant: "destructive" });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await likePost(postId);
      if (res.success) {
        // Optimistic update
        setPosts(
          posts.map((p) => {
            if (p.id === postId) {
              return { ...p, likes: res.likes };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = activeCommentsText[postId];
    if (!text || text.trim().length === 0) return;

    setSubmittingCommentId(postId);
    try {
      const res = await addComment(postId, userId, text);
      if (res.success && res.comment) {
        // Clear text
        setActiveCommentsText({ ...activeCommentsText, [postId]: "" });
        // Update local comments array
        setPosts(
          posts.map((p) => {
            if (p.id === postId) {
              return { ...p, comments: [...(p.comments || []), res.comment] };
            }
            return p;
          })
        );
        toast({ description: "Comment added.", variant: "success" });
      }
    } catch (err) {
      toast({ description: "Failed to add comment.", variant: "destructive" });
    } finally {
      setSubmittingCommentId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 animate-fade-in text-slate-100 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200/10 dark:border-slate-800/60 pb-6 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              Community Workspace
              <Users className="h-6 w-6 text-indigo-400" />
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Share project portfolios, ask questions, exchange reviews, and track peer ranking tables.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="font-bold flex items-center gap-1.5">
            <PlusCircle className="h-4.5 w-4.5" /> Share Post
          </Button>
        </div>

        <Tabs defaultValue="discussions" className="w-full text-left">
          <TabsList className="w-full max-w-md bg-slate-900 border border-slate-200/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="discussions" className="w-1/2 rounded-lg font-bold text-xs py-2">
              <MessageSquare className="h-4 w-4 mr-1.5" /> Discussion Board
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="w-1/2 rounded-lg font-bold text-xs py-2">
              <Trophy className="h-4 w-4 mr-1.5" /> Community Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DISCUSSIONS BOARD */}
          <TabsContent value="discussions" className="space-y-6 animate-fade-in">
            {loadingPosts ? (
              <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-450">Retrieving discussions...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6 max-w-3xl mx-auto">
                {posts.map((post) => (
                  <Card key={post.id} className="glass-card">
                    <CardHeader className="pb-3 text-left">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase bg-slate-900 border-slate-800 text-indigo-300">
                            {post.category}
                          </Badge>
                          {post.careerPath && (
                            <Badge variant="secondary" className="text-[9px]">
                              {post.careerPath}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-white mt-2 leading-tight">
                        {post.title}
                      </CardTitle>
                      <p className="text-[11px] text-slate-450 mt-1 font-semibold">
                        Posted by {post.user?.name || "Student User"}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6 text-left pb-4">
                      <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Likes and stats */}
                      <div className="flex items-center gap-4 border-y border-slate-800/80 py-2.5">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes} Likes</span>
                        </button>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments?.length || 0} Replies
                        </span>
                      </div>

                      {/* Replies List */}
                      {post.comments?.length > 0 && (
                        <div className="space-y-3 pl-4 border-l-2 border-indigo-500/10">
                          {post.comments.map((comment: any) => (
                            <div key={comment.id} className="text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-200/5">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                                <span>{comment.user?.name || "Peer"}</span>
                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-350 leading-relaxed font-medium">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Write a comment */}
                      <div className="flex gap-3 mt-4 items-center">
                        <Input
                          placeholder="Write a reply..."
                          value={activeCommentsText[post.id] || ""}
                          onChange={(e) =>
                            setActiveCommentsText({ ...activeCommentsText, [post.id]: e.target.value })
                          }
                          className="text-xs focus:border-indigo-500"
                        />
                        <Button
                          onClick={() => handleCommentSubmit(post.id)}
                          disabled={submittingCommentId === post.id}
                          size="sm"
                          className="h-9 px-3 shrink-0"
                        >
                          {submittingCommentId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-28 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-3 max-w-xl mx-auto">
                <MessageSquare className="h-10 w-10 text-slate-700 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-slate-400">Discussion Board is Empty</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Be the first to create a topic! Share a capstone project stack or request interview questions.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: COMMUNITY LEADERBOARD */}
          <TabsContent value="leaderboard" className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-indigo-400" /> Aura Scholar Rankings
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Earn points by completing roadmap course modules (+50), scanning resumes (+100), and winning achievement badges (+100)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    <p className="text-xs text-slate-450">Tallying academic scores...</p>
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-450 font-bold">
                          <th className="p-4 pl-6 text-center w-16">Rank</th>
                          <th className="p-4">Student Name</th>
                          <th className="p-4 text-center">Badges</th>
                          <th className="p-4 text-center">Completed Milestones</th>
                          <th className="p-4 text-right pr-6">Score Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {leaderboard.map((user, idx) => {
                          const isTop3 = idx < 3;
                          return (
                            <tr key={user.id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="p-4 pl-6 text-center font-bold">
                                {isTop3 ? (
                                  <div className="flex items-center justify-center">
                                    {idx === 0 ? (
                                      <Medal className="h-5 w-5 text-yellow-400" />
                                    ) : idx === 1 ? (
                                      <Medal className="h-5 w-5 text-slate-300" />
                                    ) : (
                                      <Medal className="h-5 w-5 text-amber-600" />
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-500 font-bold">{idx + 1}</span>
                                )}
                              </td>
                              <td className="p-4 font-bold text-white flex items-center gap-2">
                                {user.name}
                                {idx === 0 && (
                                  <span className="text-[8px] bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Top Scholar
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center text-slate-400 font-semibold">{user.badgeCount}</td>
                              <td className="p-4 text-center text-slate-400 font-semibold">{user.completedTasks}</td>
                              <td className="p-4 text-right pr-6 font-bold text-indigo-400">
                                {user.points} pts
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Award className="h-9 w-9 text-slate-700 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">Leaderboard is empty.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CREATE POST DIALOG POPUP */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Share Discussion Topic"
        description="Share career questions or projects with other students."
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="categorySel">Topic Category</Label>
              <select
                id="categorySel"
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="General">General Discussion</option>
                <option value="Showcase">Project Showcase</option>
                <option value="Q&A">Q&A Questions</option>
                <option value="Feedback">Peer Feedback</option>
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="pathSel">Career Tag</Label>
              <select
                id="pathSel"
                value={postCareerPath}
                onChange={(e) => setPostCareerPath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="All">No Tag</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="postTitle">Topic Title</Label>
            <Input
              id="postTitle"
              placeholder="e.g. Just built my first portfolio website using Next.js!"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="postCont">Content Text</Label>
            <Textarea
              id="postCont"
              placeholder="Provide context, links, or question descriptions..."
              className="h-32 text-xs"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingPost} className="font-bold">
              {submittingPost ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </Dialog>
    </DashboardShell>
  );
}
