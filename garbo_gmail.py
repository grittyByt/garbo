import imaplib
import email
from email.header import decode_header
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Define the scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

def gmail_user_auth():
    # Perform OAuth flow
    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)

    # Build the Gmail API client
    service = build('gmail', 'v1', credentials=creds)
    return service

def search_emails(service, query):


    try:
        # Search for emails matching the query
        results = service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])

        if not messages:
            print("No messages found for the query.")
            return []

        print(f"Found {len(messages)} messages matching the query.")
        email_snippets = []

        # Fetch the details of each email
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id']).execute()
            snippet = msg.get('snippet', 'No snippet available')
            email_snippets.append(snippet)
            print(f"Snippet: {snippet}")

        return email_snippets

    except Exception as e:
        print(f"An error occurred: {e}")
        return []
