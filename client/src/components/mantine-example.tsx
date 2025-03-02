
import { Button, Card, Text, Group, TextInput, Checkbox, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export function MantineExample() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  return (
    <div className="flex justify-center items-center p-8">
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 400, width: '100%' }}>
        <Text size="lg" fw={500} ta="center" mb="md">
          Mantine Example Login
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
          
          <Checkbox
            label="Remember me"
            mb="md"
            {...form.getInputProps('rememberMe', { type: 'checkbox' })}
          />
          
          <Group justify="flex-end" mt="md">
            <Button type="submit" fullWidth>
              Sign in
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
}
