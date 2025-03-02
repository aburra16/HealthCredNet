
import { useState } from 'react';
import { 
  Button, Card, Text, Group, TextInput, Checkbox, PasswordInput,
  Tabs, Accordion, Badge, Switch, Select, Avatar, Alert, Loader,
  Container, Title, Divider, Notification, NumberInput, Stepper
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';

export function MantineExample() {
  const [activeTab, setActiveTab] = useState<string | null>('login');
  const [activeStep, setActiveStep] = useState(0);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
      name: '',
      dob: null as Date | null,
      specialty: '',
      experience: 0,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
    },
  });

  const nextStep = () => setActiveStep((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg" ta="center">Mantine UI Components</Title>
      <Text mb="lg" ta="center" c="dimmed">
        This page demonstrates various Mantine UI components that can be used in your application.
      </Text>

      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List grow>
          <Tabs.Tab value="login">Authentication</Tabs.Tab>
          <Tabs.Tab value="profile">Provider Profile</Tabs.Tab>
          <Tabs.Tab value="components">UI Components</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login">
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 500, margin: '0 auto' }}>
            <Text size="lg" fw={500} ta="center" mb="md">
              Healthcare Provider Login
            </Text>
            
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                mb="md"
                {...form.getInputProps('email')}
              />
              
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                mb="md"
                {...form.getInputProps('password')}
              />
              
              <Group justify="space-between" mb="md">
                <Checkbox
                  label="Remember me"
                  {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                />
                <Text size="sm" c="blue" style={{ cursor: 'pointer' }}>
                  Forgot password?
                </Text>
              </Group>
              
              <Button type="submit" fullWidth>
                Sign in
              </Button>
            </form>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="profile">
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 600, margin: '0 auto' }}>
            <Group mb="md">
              <Avatar size="xl" radius="xl" color="blue">MD</Avatar>
              <div>
                <Text size="lg" fw={500}>Provider Registration</Text>
                <Text size="sm" c="dimmed">Complete your healthcare provider profile</Text>
              </div>
            </Group>

            <Stepper active={activeStep} onStepClick={setActiveStep} mb="xl">
              <Stepper.Step label="Personal Info" description="Basic details">
                <TextInput
                  label="Full Name"
                  placeholder="Dr. Jane Smith"
                  required
                  mb="md"
                  {...form.getInputProps('name')}
                />
                
                <DatePickerInput
                  label="Date of Birth"
                  placeholder="Select date"
                  mb="md"
                  {...form.getInputProps('dob')}
                />
              </Stepper.Step>
              
              <Stepper.Step label="Specialization" description="Professional details">
                <Select
                  label="Medical Specialty"
                  placeholder="Select specialty"
                  data={[
                    'Cardiology',
                    'Dermatology',
                    'Family Medicine',
                    'Internal Medicine',
                    'Neurology',
                    'Obstetrics & Gynecology',
                    'Pediatrics',
                    'Psychiatry',
                    'Surgery'
                  ]}
                  mb="md"
                  {...form.getInputProps('specialty')}
                />
                
                <NumberInput
                  label="Years of Experience"
                  placeholder="Years of practice"
                  min={0}
                  max={50}
                  mb="md"
                  {...form.getInputProps('experience')}
                />
              </Stepper.Step>
              
              <Stepper.Step label="Credentials" description="License verification">
                <Alert title="Verification Required" color="yellow" mb="md">
                  Please be prepared to submit your medical license for verification.
                </Alert>
                
                <TextInput
                  label="License Number"
                  placeholder="e.g. MD12345"
                  mb="md"
                />
                
                <Select
                  label="Issuing Authority"
                  placeholder="Select state/authority"
                  data={['California Medical Board', 'New York State Board', 'Texas Medical Board']}
                  mb="md"
                />
              </Stepper.Step>
              
              <Stepper.Completed>
                <Notification title="Profile Ready" color="green" withCloseButton={false}>
                  Your profile information has been saved. Your account will be fully activated once your credentials have been verified.
                </Notification>
              </Stepper.Completed>
            </Stepper>

            <Group justify="space-between" mt="xl">
              {activeStep > 0 && (
                <Button variant="default" onClick={prevStep}>
                  Back
                </Button>
              )}
              {activeStep < 3 ? (
                <Button onClick={nextStep}>
                  Next step
                </Button>
              ) : (
                <Button color="green">
                  Complete Registration
                </Button>
              )}
            </Group>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="components">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Text fw={500}>Interactive Elements</Text>
              </Card.Section>
              
              <Group mt="md" mb="md">
                <Button>Primary</Button>
                <Button variant="light">Light</Button>
                <Button variant="outline">Outline</Button>
              </Group>
              
              <Divider my="sm" />
              
              <Group mt="md" mb="md">
                <Switch label="Notifications" />
                <Switch label="Email updates" defaultChecked />
              </Group>
              
              <Divider my="sm" />
              
              <Select
                label="Select option"
                placeholder="Pick one"
                data={['React', 'Angular', 'Vue', 'Svelte']}
                mt="md"
              />
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Text fw={500}>Information Display</Text>
              </Card.Section>
              
              <Group mt="md" wrap="nowrap">
                <Badge color="blue">New</Badge>
                <Badge color="green">Approved</Badge>
                <Badge color="red">Urgent</Badge>
                <Badge color="gray">Inactive</Badge>
              </Group>
              
              <Divider my="sm" />
              
              <Accordion mt="md">
                <Accordion.Item value="item1">
                  <Accordion.Control>What is MedCred?</Accordion.Control>
                  <Accordion.Panel>
                    MedCred is a decentralized healthcare credential management platform using Nostr protocol.
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="item2">
                  <Accordion.Control>How does verification work?</Accordion.Control>
                  <Accordion.Panel>
                    Credentials are cryptographically signed and verified using the Nostr protocol.
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
              
              <Divider my="sm" />
              
              <Group mt="md" align="center">
                <Loader size="sm" />
                <Text size="sm">Loading data...</Text>
              </Group>
            </Card>
          </div>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
