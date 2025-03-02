
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Avatar, 
  Group, 
  Tabs, 
  TextInput, 
  Button, 
  Divider,
  Paper,
  Badge,
  ActionIcon,
  SimpleGrid
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function UserProfileMantine() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>("profile");

  const profileForm = useForm({
    initialValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      phone: "555-123-4567",
      address: "123 Healthcare Ave, Medical District",
    },
    validate: {
      displayName: (value) => (value.length < 2 ? "Name must have at least 2 characters" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const securityForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validate: {
      newPassword: (value) => (value.length < 8 ? "Password must be at least 8 characters" : null),
      confirmNewPassword: (value, values) =>
        value !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  return (
    <Container size="lg">
      <Paper p="md" withBorder mb="xl">
        <Group position="apart">
          <div>
            <Title order={2}>Healthcare Professional Profile</Title>
            <Text c="dimmed">Manage your personal and security settings</Text>
          </div>
          <Badge color="blue" size="lg">Verified Provider</Badge>
        </Group>
      </Paper>

      <Card shadow="sm" withBorder p={0} mb="xl">
        <Card.Section withBorder p="md">
          <Group>
            <Avatar size="xl" radius="xl" color="blue">
              {user?.displayName?.charAt(0) || "U"}
            </Avatar>
            <div>
              <Text size="lg" fw={500}>{user?.displayName || "Healthcare Provider"}</Text>
              <Text size="sm" c="dimmed">NIC: {user?.npub?.slice(0, 8)}...{user?.npub?.slice(-4)}</Text>
              <Group spacing="xs" mt={4}>
                <Badge color="green" variant="light">General Medicine</Badge>
                <Badge color="blue" variant="light">Verified</Badge>
              </Group>
            </div>
          </Group>
        </Card.Section>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="profile">Profile Information</Tabs.Tab>
            <Tabs.Tab value="security">Security Settings</Tabs.Tab>
            <Tabs.Tab value="credentials">Credentials</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" p="md">
            <form onSubmit={profileForm.onSubmit((values) => console.log(values))}>
              <TextInput
                label="Display Name"
                placeholder="Your name"
                mb="md"
                {...profileForm.getInputProps("displayName")}
              />
              
              <TextInput
                label="Email"
                placeholder="Your email"
                mb="md"
                {...profileForm.getInputProps("email")}
              />
              
              <TextInput
                label="Phone Number"
                placeholder="Your phone number"
                mb="md"
                {...profileForm.getInputProps("phone")}
              />
              
              <TextInput
                label="Address"
                placeholder="Your address"
                mb="md"
                {...profileForm.getInputProps("address")}
              />
              
              <Group position="right" mt="xl">
                <Button type="submit">Save Changes</Button>
              </Group>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="security" p="md">
            <form onSubmit={securityForm.onSubmit((values) => console.log(values))}>
              <TextInput
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                mb="md"
                {...securityForm.getInputProps("currentPassword")}
              />
              
              <TextInput
                label="New Password"
                type="password"
                placeholder="Enter new password"
                mb="md"
                {...securityForm.getInputProps("newPassword")}
              />
              
              <TextInput
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                mb="md"
                {...securityForm.getInputProps("confirmNewPassword")}
              />
              
              <Group position="right" mt="xl">
                <Button type="submit">Update Password</Button>
              </Group>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="credentials" p="md">
            <Text mb="md">Your verified healthcare credentials</Text>
            
            <SimpleGrid cols={2} spacing="md" mb="md">
              <Card shadow="sm" p="md" withBorder>
                <Group position="apart" mb="xs">
                  <Text fw={500}>Medical License</Text>
                  <Badge color="green">Verified</Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="md">Medical Board of California</Text>
                <Text size="sm">License #: MD12345678</Text>
                <Text size="sm">Issued: 01/15/2021</Text>
                <Text size="sm">Expires: 01/15/2025</Text>
              </Card>
              
              <Card shadow="sm" p="md" withBorder>
                <Group position="apart" mb="xs">
                  <Text fw={500}>Board Certification</Text>
                  <Badge color="green">Verified</Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="md">American Board of Internal Medicine</Text>
                <Text size="sm">Cert #: IM98765432</Text>
                <Text size="sm">Issued: 06/22/2022</Text>
                <Text size="sm">Expires: 06/22/2027</Text>
              </Card>
            </SimpleGrid>
            
            <Divider my="md" />
            
            <Group position="right">
              <Button variant="outline">Add New Credential</Button>
            </Group>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Container>
  );
}
