import { DrawerContext } from "@/app/_layout";
import { LayoutList, MessageSquarePlus } from "lucide-react-native";
import { useContext } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { View } from "react-native";
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
export const Header = () => {
  const { isOpen, setOpen } = useContext(DrawerContext);
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex flex-row items-center justify-between"
      style={{
        paddingTop: insets.top + 4,
        paddingLeft: insets.left + 4,
        paddingRight: insets.right + 4,
      }}>
      <Button variant="ghost" size="icon" onPress={() => setOpen(true)}>
        <Icon as={LayoutList} size={24} />
      </Button>
      <Text className="text-lg font-bold">test</Text>
      <Button variant="ghost" size="icon">
        <Icon as={MessageSquarePlus} size={24} />
      </Button>
    </View>
  );
};
