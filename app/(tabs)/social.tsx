import { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions, Animated, RefreshControl,
  TextInput, KeyboardAvoidingView, Platform, Modal,
  Share, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SocialAPI, CartAPI } from '../../src/services/api';
import { useAuth } from '../../src/store/auth';

const { height: H } = Dimensions.get('window');

interface Post {
  id: string;
  content: string | null;
  images: string[];
  user: { id: string; name: string; avatar: string | null };
  products: {
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      salePrice: number | null;
      images: string[];
    };
  }[];
  likes?: { id: string; userId: string }[];
  _count: { likes: number; comments: number };
  createdAt: string;
  isLiked?: boolean;
}

export default function SocialScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  async function fetchPosts(p = 1, replace = false) {
    try {
      const data: any = await SocialAPI.feed({ page: p, limit: 10 });
      const list = data?.data?.posts || data?.posts || [];
      const meta = data?.data?.meta || data?.meta || {};
      const mapped: Post[] = list.map((post: any) => ({
        ...post,
        likes: post.likes || [],
        isLiked: (post.likes || []).some((l: any) => l.userId === user?.id),
      }));
      setPosts((prev) => (replace ? mapped : [...prev, ...mapped]));
      setHasMore(meta.hasMore ?? false);
    } catch (e) {
      console.error('[social]', e);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { fetchPosts(1, true); }, []);

  function onRefresh() {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  }

  function onEndReached() {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#1B3A5C" />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Нийгмийн худалдаа</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/create-post' as any)}
          style={s.createBtn}
        >
          <Text style={s.createBtnText}>＋ Пост</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLikeChange={(updated) =>
              setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            }
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        ListEmptyComponent={<EmptyFeed />}
      />
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function PostCard({
  post, onLikeChange,
}: {
  post: Post;
  onLikeChange: (p: Post) => void;
}) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComment, setShowComment] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);
  const heartAnim = useRef(new Animated.Value(0)).current;

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) handleLike();
      heartAnim.setValue(0);
      Animated.sequence([
        Animated.spring(heartAnim, { toValue: 1.5, useNativeDriver: true }),
        Animated.timing(heartAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
    lastTap.current = now;
  }

  async function handleLike() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    try {
      if (newLiked) await SocialAPI.like(post.id);
      else await SocialAPI.unlike(post.id);
      onLikeChange({ ...post, isLiked: newLiked, _count: { ...post._count, likes: newLiked ? likeCount + 1 : likeCount - 1 } });
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  }

  async function handleAddToCart(productId: string) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAddedToCart(productId);
    try { await CartAPI.add({ productId, quantity: 1 }); } catch {}
    setTimeout(() => setAddedToCart(null), 2000);
  }

  async function handleShare() {
    const product = post.products[0]?.product;
    await Share.share({
      message: `${post.content ?? ''}\n\nhttps://eseller.mn/product/${product?.id}`,
      title: product?.name ?? 'eseller.mn',
    });
  }

  const timeAgo = formatTimeAgo(post.createdAt);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.avatar}>
          {post.user.avatar ? (
            <Image source={{ uri: post.user.avatar }} style={s.avatarImg} />
          ) : (
            <Text style={s.avatarText}>{post.user.name?.[0] || '?'}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName}>{post.user.name}</Text>
          <Text style={s.timeAgo}>{timeAgo}</Text>
        </View>
        <TouchableOpacity style={s.moreBtn}>
          <Text style={{ color: '#aaa', fontSize: 18 }}>···</Text>
        </TouchableOpacity>
      </View>

      {post.content && <Text style={s.postContent}>{post.content}</Text>}

      {post.images.length > 0 && (
        <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={s.imageContainer}>
          <Image source={{ uri: post.images[0] }} style={s.postImage} resizeMode="cover" />
          <Animated.Text style={[
            s.heartOverlay,
            { opacity: heartAnim, transform: [{ scale: heartAnim }] },
          ]}>
            ❤️
          </Animated.Text>
        </TouchableOpacity>
      )}

      {post.products.length > 0 && (
        <View style={s.productsSection}>
          <Text style={s.productsSectionTitle}>Бүтээгдэхүүнүүд</Text>
          {post.products.map(({ id, product }) => (
            <TouchableOpacity
              key={id}
              onPress={() => router.push(`/product/${product.id}` as any)}
              style={s.productCard}
            >
              <Image
                source={{ uri: product.images?.[0] || 'https://via.placeholder.com/52' }}
                style={s.productThumb}
              />
              <View style={s.productInfo}>
                <Text style={s.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={s.productPrice}>
                  {(product.salePrice ?? product.price).toLocaleString()}₮
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleAddToCart(product.id)}
                style={[s.addCartBtn, addedToCart === product.id && { backgroundColor: '#3B6D11' }]}
              >
                <Text style={s.addCartBtnText}>
                  {addedToCart === product.id ? '✓ Нэмэгдлээ' : '🛒 Авах'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={s.actions}>
        <TouchableOpacity onPress={handleLike} style={s.actionBtn}>
          <Animated.Text style={[s.actionIcon, { transform: [{ scale: scaleAnim }] }]}>
            {liked ? '❤️' : '🤍'}
          </Animated.Text>
          <Text style={[s.actionCount, liked && { color: '#E74C3C' }]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComment(true)} style={s.actionBtn}>
          <Text style={s.actionIcon}>💬</Text>
          <Text style={s.actionCount}>{post._count.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={s.actionBtn}>
          <Text style={s.actionIcon}>↗️</Text>
          <Text style={s.actionCount}>Хуваалцах</Text>
        </TouchableOpacity>
      </View>

      <CommentModal postId={post.id} visible={showComment} onClose={() => setShowComment(false)} />
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMENT MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CommentModal({
  postId, visible, onClose,
}: {
  postId: string;
  visible: boolean;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible) {
      SocialAPI.comments(postId)
        .then((d: any) => setComments(d?.data?.comments || d?.comments || []))
        .catch(() => {});
    }
  }, [visible, postId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const resp: any = await SocialAPI.comment(postId, text.trim());
      const c = resp?.data || resp;
      setComments((prev) => [c, ...prev]);
      setText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSending(false);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.commentSheet}
      >
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>Сэтгэгдлүүд</Text>

        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          style={{ flex: 1, paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View style={s.commentItem}>
              <View style={s.commentAvatar}>
                <Text style={s.commentAvatarText}>{item.user?.name?.[0] || '?'}</Text>
              </View>
              <View style={s.commentBody}>
                <Text style={s.commentUser}>{item.user?.name || 'Хэрэглэгч'}</Text>
                <Text style={s.commentText}>{item.content}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={s.emptyText}>Сэтгэгдэл байхгүй байна</Text>}
        />

        <View style={s.commentInput}>
          <TextInput
            style={s.commentTextInput}
            placeholder="Сэтгэгдэл бичих..."
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[s.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMPTY STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function EmptyFeed() {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>📸</Text>
      <Text style={s.emptyTitle}>Одоогоор пост байхгүй</Text>
      <Text style={s.emptySub}>Найзуудынхаа худалдан авалтыг энд харна</Text>
    </View>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Дөнгөж сая';
  if (m < 60) return `${m} мин`;
  if (h < 24) return `${h} цаг`;
  return `${d} өдөр`;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1B3A5C' },
  createBtn: { backgroundColor: '#1B3A5C', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  createBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2, overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B3A5C',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 40, height: 40 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  timeAgo: { fontSize: 11, color: '#aaa', marginTop: 1 },
  moreBtn: { padding: 4 },
  postContent: { fontSize: 14, color: '#333', lineHeight: 20, paddingHorizontal: 14, paddingBottom: 10 },
  imageContainer: { width: '100%', aspectRatio: 1, position: 'relative' },
  postImage: { width: '100%', height: '100%' },
  heartOverlay: { position: 'absolute', top: '40%', left: '40%', fontSize: 72 },
  productsSection: { padding: 12, borderTopWidth: 0.5, borderTopColor: '#f0f0f0' },
  productsSectionTitle: { fontSize: 11, color: '#888', marginBottom: 8, fontWeight: '500' },
  productCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  productThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#f0f0f0' },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '500', color: '#1a1a1a' },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#1B3A5C', marginTop: 2 },
  addCartBtn: { backgroundColor: '#1B3A5C', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  addCartBtnText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  actions: {
    flexDirection: 'row', gap: 4, padding: 12, paddingTop: 8,
    borderTopWidth: 0.5, borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8,
  },
  actionIcon: { fontSize: 18 },
  actionCount: { fontSize: 13, color: '#666', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  commentSheet: { backgroundColor: '#fff', borderRadius: 24, maxHeight: H * 0.75, paddingBottom: 24 },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 10 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', padding: 16, paddingBottom: 12 },
  commentItem: { flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' },
  commentAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#1B3A5C',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  commentAvatarText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  commentBody: { flex: 1 },
  commentUser: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },
  commentText: { fontSize: 13, color: '#444', marginTop: 2, lineHeight: 18 },
  commentInput: {
    flexDirection: 'row', gap: 8, padding: 12,
    borderTopWidth: 0.5, borderTopColor: '#e5e5e5',
  },
  commentTextInput: {
    flex: 1, backgroundColor: '#F5F7FA', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, maxHeight: 80,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1B3A5C',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  emptyText: { textAlign: 'center', color: '#aaa', fontSize: 13, padding: 24 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center', lineHeight: 18 },
});
