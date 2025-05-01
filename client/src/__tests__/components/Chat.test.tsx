import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import Chat from '../../components/Chat';

/*
Test cases to consider (ex: Chat)

- What components do we want to render?
- User interaction:
  \_ Does the component render when visible/invisible?
  \_ What happens when user types in the input?
  \_ What happens when a user clicks send?
  \_ Does pressing Enter work?
- Does the component receive/respond to props?
- Are messages added correctly?
*/

describe('Chat component', () => {
  let chat: any;
  const mockProps = {
    isVisible: false,
    toggleChatbox: jest.fn(),
  };

  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // create & assign fetch mock with proper typing.
    const mockFetch = jest.fn();
    window.fetch = mockFetch;

    jest.clearAllMocks();
    chat = render(<Chat {...mockProps} />);
  });

  afterAll(() => {
    // reset all console.errrors
    jest.restoreAllMocks();
  });

  // 1. Render chat visible
  test('Renders component visible based on isVisible prop', () => {
    // chat class is what's changing based on the props
    const chatContainer = chat.container.querySelector('.chat');
    expect(chatContainer).not.toHaveClass('visible');

    // rerender with isVisible = true
    chat.rerender(<Chat {...mockProps} isVisible={true} />);

    // check if the class has been applied
    expect(chatContainer).toHaveClass('visible');

    // check if header is present present
    expect(screen.getByText('Chat with Martians')).toBeInTheDocument();
  });

  // 2. Test typing functionality
  test('Allow user to type a message in the input field', () => {
    // make sure our component is visible
    chat.rerender(<Chat {...mockProps} isVisible={true} />);

    const inputField = screen.getByPlaceholderText('Speak to Martian Axolotl');

    // Test that typing updates the input value
    fireEvent.change(inputField, { target: { value: 'Hey to Mars' } });

    // Verify the input field shows the typed text
    expect(inputField).toHaveValue('Hey to Mars');
  });

  // 3. test send button functionality
  test('Sends message and clears input when send button is clicked', () => {
    // 1. rerender the component to make sure it's visibel
    chat.rerender(<Chat {...mockProps} isVisible={true} />);

    // 2. grabd the in placeholder
    const inputField = screen.getByPlaceholderText('Speak to Martian Axolotl');

    // 3. change the input to some message
    fireEvent.change(inputField, { target: { value: 'Testing send button' } });

    // 4. test sending the message, i.e. check button click functionality
    const sendButton = screen.getByRole('img');
    fireEvent.click(sendButton);

    // 5. the message should appear in the chat
    expect(screen.getByText('Testing send button')).toBeInTheDocument();

    // input should be cleared after sending
    expect(inputField).toHaveValue('');
  });

  // 4. Press enter - does it work?
  test('Sends message when Enter key is pressed', () => {
    chat.rerender(<Chat {...mockProps} isVisible={true} />);

    const inputField = screen.getByPlaceholderText('Speak to Martian Axolotl');
    fireEvent.change(inputField, {
      target: { value: 'Send mssg via enter key' },
    });

    // Simulate pressing Enter
    fireEvent.keyDown(inputField, { key: 'Enter' });

    // Message should appear in chat
    expect(screen.getByText('Send mssg via enter key')).toBeInTheDocument();

    // Input should be cleared
    expect(inputField).toHaveValue('');
  });

  // 5. Do props work?
  test('toggleChatbox prop is called when X close button is clicked', () => {
    chat.rerender(<Chat {...mockProps} isVisible={true} />);

    // find and click the close button (X button or similar)
    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton);

    // check if toggleChatbox function was called
    expect(mockProps.toggleChatbox).toHaveBeenCalledTimes(1);
  });

  // 6. Messages being added?
  // - Add second message
  // - first message should have earth class, second should have mars class
  test('Multiple messages are added with alternating classes', () => {
    chat.rerender(<Chat {...mockProps} isVisible={true} />);
    const inputField = screen.getByPlaceholderText('Speak to Martian Axolotl');

    // send first message (from Earth)
    fireEvent.change(inputField, {
      target: { value: 'First message from Earth' },
    });
    fireEvent.click(screen.getByRole('img'));

    // check first message has earth class
    const firstMessage = screen.getByText('First message from Earth');
    expect(firstMessage).toHaveClass('message-earth');

    // Send second message (First message from Mars)
    fireEvent.change(inputField, {
      target: { value: 'First message from Mars' },
    });
    fireEvent.click(screen.getByRole('img'));
    const marsMessage = screen.getByText('First message from Mars');
    expect(marsMessage).toHaveClass('message-mars');
  });

  // 7. test empty message handling
  test('Does not send empty messages', () => {
    chat.rerender(<Chat {...mockProps} isVisible={true} />);
    const inputField = screen.getByPlaceholderText('Speak to Martian Axolotl');

    // send empty message
    fireEvent.change(inputField, { target: { value: '' } });
    fireEvent.click(screen.getByRole('img'));

    // check that no new message elements were added
    // this assumes your messages are in elements with class 'message'
    const messageElements = document.querySelectorAll('.message');
    expect(messageElements.length).toBe(0);
  });

  // 8. test API interaction
  test('Makes API call and displays the response', async () => {
    chat.rerender(<Chat {...mockProps} isVisible={true} />);

    // return a successful response using mock fetch
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: 'Greetings from Mars!' }),
    });

    // Grab the input field element
    const inputField = screen.getByPlaceholderText('Speak to Martian Axolotl');

    // Type in and send a message
    fireEvent.change(inputField, { target: { value: 'Hello Mars' } });
    fireEvent.click(screen.getByRole('img'));

    // Grab the response from our API call
    await screen.findByText('Greetings from Mars!');

    // confirm fetch was called with correct args
    expect(window.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello Mars' }),
    });

    // verify 2 messages are displayed
    expect(screen.getByText('Hello Mars')).toBeInTheDocument();
    expect(screen.getByText('Greetings from Mars!')).toBeInTheDocument();

    // Clean up
    (window.fetch as jest.Mock).mockRestore();
  });
});
