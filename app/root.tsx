import { json, redirect } from "@remix-run/node";
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
// existing imports
import { createEmptyContact, getContacts } from "./data";

// If you're using the Classic Remix Compiler rather than Remix Vite, you should remove ?url from the end of your CSS import paths.
import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// loader functions have access to the search params from the request. Let's use it to filter the list:
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const { contacts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            {/* Because this is a GET, not a POST, Remix does not call the action function. Submitting a GET form is the same as clicking a link: only the URL changes. */}
                        {/* Since it's not <Form method="post">, Remix emulates the browser by serializing the FormData into the URLSearchParams instead of the request body. */}
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>

        <div
          className={navigation.state === "loading" ? "loading" : ""}
          id="detail"
        >
          {/* Renders the matching child route of a parent route. */}
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
