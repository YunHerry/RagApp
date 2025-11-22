import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { ChevronRight, LayoutList, MessageSquare, MessageSquarePlus, MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useContext } from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { DrawerContext } from './_layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient';
const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

const header = () => {
  const insets = useSafeAreaInsets();
  return <View className='flex flex-row justify-between items-center' style={{
    paddingTop: insets.top + 4,
    paddingLeft: insets.left + 4,
    paddingRight: insets.right + 4
  }}>
    <Button variant="ghost" size="icon">
      <Icon as={LayoutList} size={24} />
    </Button>
    <Text className='font-bold text-lg'>test</Text>
    <Button variant="ghost" size="icon">
      <Icon as={MessageSquarePlus} size={24} />
    </Button>
  </View>
}

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { isOpen, setOpen } = useContext(DrawerContext);
  const insets = useSafeAreaInsets();
  const SCREEN_OPTIONS:ExtendedStackNavigationOptions = {
    title: 'React Native Reusables',

    headerRight: () => <ThemeToggle />,
  };

  return (
    <>
      <Stack.Screen options={{
        header
      }} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            1. Edit <Text variant="code">app/index.tsx</Text> to get started.
          </Text>
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            2. Save to see your changes instantly.
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button>
            <Text>Browse the Docs</Text>
          </Button>
          {/* <Button variant="ghost" onPress={() => setOpen(true)}>
              <Text>Star the Repo</Text>
              <Icon as={StarIcon} />
            </Button> */}
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
