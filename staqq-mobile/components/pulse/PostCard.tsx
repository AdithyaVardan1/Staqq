import { Text, View, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { MessageCircle, ArrowUp, ExternalLink } from 'lucide-react-native';
import Badge from '../ui/Badge';
import StockChip from '../ui/StockChip';
import type { SocialPost } from '../../lib/api';

function timeAgo(timestamp: number): string {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

interface Props {
    post: SocialPost;
}

export default function PostCard({ post }: Props) {
    const sourceEmoji = post.source === 'reddit' ? '🟠' : '𝕏';

    return (
        <TouchableOpacity
            onPress={() => Linking.openURL(post.url)}
            className="mx-4 my-1.5 bg-bg-card border border-white/5 rounded-2xl p-4"
            activeOpacity={0.8}
        >
            {/* Header */}
            <View className="flex-row items-center mb-2">
                <Text className="text-sm mr-1.5">{sourceEmoji}</Text>
                <Text className="text-zinc-400 text-xs flex-1" numberOfLines={1}>
                    {post.source === 'reddit' ? `r/${post.community}` : post.community}
                </Text>
                {post.isHot && <Badge label="HOT" variant="hot" />}
            </View>

            {/* Title */}
            <Text className="text-white font-semibold text-sm mb-1.5" numberOfLines={2}>
                {post.title}
            </Text>

            {/* Body */}
            {post.body ? (
                <Text className="text-zinc-400 text-xs leading-4 mb-2" numberOfLines={3}>
                    {post.body}
                </Text>
            ) : null}

            {/* Image */}
            {post.image && (
                <Image
                    source={{ uri: post.image }}
                    className="w-full rounded-xl mb-2"
                    style={{ height: 160 }}
                    resizeMode="cover"
                />
            )}

            {/* Tickers */}
            {post.tickers.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {post.tickers.map(t => (
                        <StockChip key={t} ticker={t} />
                    ))}
                </ScrollView>
            )}

            {/* Footer */}
            <View className="flex-row items-center mt-1">
                <ArrowUp size={12} color="#71717A" />
                <Text className="text-zinc-500 text-[10px] ml-0.5 mr-3">{post.score}</Text>
                <MessageCircle size={12} color="#71717A" />
                <Text className="text-zinc-500 text-[10px] ml-0.5 mr-3">{post.comments}</Text>
                {post.author && (
                    <Text className="text-zinc-600 text-[10px] flex-1" numberOfLines={1}>
                        u/{post.author}
                    </Text>
                )}
                <Text className="text-zinc-600 text-[10px]">{timeAgo(post.createdAt)}</Text>
                <ExternalLink size={10} color="#52525B" style={{ marginLeft: 6 }} />
            </View>
        </TouchableOpacity>
    );
}
