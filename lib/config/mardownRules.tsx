import { RenderRules } from "react-native-markdown-display"
import { Text } from '@/components/ui/text';
import classNames from "classnames";
import { Separator } from "@/components/ui/separator";

export const createMarkdownRules = (isDark: boolean): Partial<RenderRules> => ({
  text: (node, children, parent, styles) => (
    <Text
      key={node.key}
      className={classNames({
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {node.content}
    </Text>
  ),

  heading1: (node, children, parent, styles) => (
    <Text
      key={node.key}
      className={classNames('text-2xl font-bold', {
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {children}
    </Text>
  ),

  // 标题 h2
  heading2: (node, children, parent, styles) => (
    <Text
      key={node.key}
      className={classNames('text-xl font-bold', {
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {children}
    </Text>
  ),

  // 标题 h3
  heading3: (node, children, parent, styles) => (
    <Text
      key={node.key}
      variant="h3"
      className={classNames('text-xl font-bold', {
        'text-white': isDark,
        'text-gray-900': !isDark,
      })}>
      {children}
    </Text>
  ),

  // 分割线
  hr: (node, children, parent, styles) => <Separator key={node.key} className="my-4" />,
});
