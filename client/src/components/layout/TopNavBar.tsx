import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home as HomeIcon, 
  User, 
  FileCheck, 
  Award, 
  ClipboardList,
  BarChart4, 
  LogOut,
  BrainCircuit,
  Shield,
  Palette
} from "lucide-react";
import { 
  AppShell, 
  Avatar, 
  Group, 
  Title, 
  Text, 
  Button, 
  rem, 
  Divider, 
  ActionIcon,
  Menu,
  UnstyledButton,
  Box
} from '@mantine/core';

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // If no user is logged in, don't show the navigation bar
  if (!user) return null;

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <AppShell.Header p="xs">
      <Group justify="space-between" h="100%">
        {/* Logo */}
        <Group>
          <Link href="/">
            <Group gap={rem(10)}>
              <Avatar 
                color="blue" 
                radius="md"
                style={{ width: rem(36), height: rem(36) }}
              >
                <Shield size="20" strokeWidth={2.5} />
              </Avatar>
              <Box>
                <Title order={4} fw={700} c="blue">MedCred</Title>
                <Text size="xs" tt="uppercase" c="dimmed" fw={500} lts={1}>Trusted Verifications</Text>
              </Box>
            </Group>
          </Link>
        </Group>

        {/* Navigation Links */}
        <Group>
          {/* Home */}
          <Link href="/">
            <Button
              variant={isActive('/') ? "light" : "subtle"}
              color="blue"
              size="compact-sm"
              leftSection={<HomeIcon size="16" />}
            >
              Home
            </Button>
          </Link>

          {/* Mantine Example Link */}
          <Link href="/mantine-example">
            <Button
              variant={isActive('/mantine-example') ? "light" : "subtle"}
              color="blue"
              size="compact-sm"
              leftSection={<Palette size="16" />}
            >
              Mantine UI
            </Button>
          </Link>

          {/* User-specific navigation */}
          {user.role === 'user' && (
            <>
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<BrainCircuit size="16" />}
                >
                  Find Providers
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button
                  variant={isActive('/dashboard/profile') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<User size="16" />}
                >
                  Profile
                </Button>
              </Link>
            </>
          )}

          {/* Provider-specific navigation */}
          {user.role === 'provider' && (
            <>
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<User size="16" />}
                >
                  Profile
                </Button>
              </Link>
              <Link href="/dashboard/credentials">
                <Button
                  variant={isActive('/dashboard/credentials') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<Award size="16" />}
                >
                  Credentials
                </Button>
              </Link>
            </>
          )}

          {/* Authority-specific navigation */}
          {user.role === 'authority' && (
            <>
              <Link href="/authority/dashboard">
                <Button
                  variant={isActive('/authority/dashboard') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<BarChart4 size="16" />}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/authority/issue">
                <Button
                  variant={isActive('/authority/issue') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<FileCheck size="16" />}
                >
                  Issue Credentials
                </Button>
              </Link>
              <Link href="/authority/audit-logs">
                <Button
                  variant={isActive('/authority/audit-logs') ? "light" : "subtle"}
                  color="blue"
                  size="compact-sm"
                  leftSection={<ClipboardList size="16" />}
                >
                  Audit Logs
                </Button>
              </Link>
            </>
          )}

          <Divider orientation="vertical" />

          {/* User Menu */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar color="blue" radius="xl" size="sm">
                    {(user.displayName || user.username).charAt(0).toUpperCase()}
                  </Avatar>
                  <Box style={{ flexGrow: 1 }}>
                    <Text size="sm" fw={500}>
                      {user.displayName || user.username}
                    </Text>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      {user.role}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item 
                leftSection={<User size="14" />}
                component={Link} 
                href="/dashboard/profile"
              >
                My Profile
              </Menu.Item>
              <Menu.Item 
                leftSection={<User size="14" />}
                component={Link} 
                href="/dashboard/profile-mantine"
                c="dimmed"
              >
                Mantine Profile (Dev)
              </Menu.Item>
              <Menu.Item 
                leftSection={<Award size="14" />}
                component={Link} 
                href="/dashboard/credentials"
              >
                My Credentials
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                color="red" 
                leftSection={<LogOut size="14" />}
                onClick={logout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}