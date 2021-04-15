import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Posts from "./Posts";

const mockPostsData = [
  {
    userId: 1,
    id: 1,
    title:
      "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    body:
      "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
  },
  {
    userId: 1,
    id: 2,
    title: "qui est esse",
    body:
      "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla",
  },
  {
    userId: 1,
    id: 3,
    title: "ea molestias quasi exercitationem repellat qui ipsa sit aut",
    body:
      "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut",
  },
];

const mockNewPostData = {
  userId: 1,
  id: 8,
  title: "dolorem dolore est ipsam",
  body:
    "dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae",
};

describe("Posts", () => {
  beforeEach(() => {
    global.fetch = jest.fn((_, options) => {
      if (options?.method === "POST") {
        return Promise.resolve({
          json: () => Promise.resolve(mockNewPostData),
        });
      } else {
        return Promise.resolve({
          json: () => Promise.resolve(mockPostsData),
        });
      }
    });
  });

  test("fetch and render posts", async () => {
    render(<Posts />);

    expect(window.fetch).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/posts"
    );

    await waitFor(() =>
      mockPostsData.forEach((post) =>
        expect(screen.getByText(post.title)).toBeInTheDocument()
      )
    );
  });

  test("click on cancel should hide the form and reset input to default value", async () => {
    render(<Posts />);

    await waitFor(() =>
      fireEvent.click(screen.getByRole("button", { name: "Add New Post" }))
    );

    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "New Post Title" },
    });
    expect(screen.queryByPlaceholderText("Title").value).toBe("New Post Title");

    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByPlaceholderText("Title")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Add New Post"));
    expect(screen.queryByPlaceholderText("Title").value).toBe("");
  });

  test("create and render a new post and submit a form", async () => {
    render(<Posts />);

    // Open the form
    await waitFor(() => fireEvent.click(screen.getByText("Add New Post")));

    const titleInputEl = screen.getByPlaceholderText("Title");
    const bodyTextareaEl = screen.getByPlaceholderText("Body");
    const submitBtnEl = screen.getByRole("button", { name: "Submit" });

    expect(titleInputEl.value).toBe("");
    expect(bodyTextareaEl.value).toBe("");
    expect(submitBtnEl).toBeInTheDocument();

    // Start typing
    fireEvent.change(titleInputEl, {
      target: { value: mockNewPostData.title },
    });
    fireEvent.change(bodyTextareaEl, {
      target: { value: mockNewPostData.body },
    });

    // Submit the form
    await waitFor(() => fireEvent.click(submitBtnEl));

    // Form should be hidden
    expect(titleInputEl).not.toBeInTheDocument();
    expect(bodyTextareaEl).not.toBeInTheDocument();

    // New post is displayed
    expect(screen.getByText(mockNewPostData.title)).toBeInTheDocument();
    expect(
      screen.getByText(/dignissimos aperiam dolorem qui eum/)
    ).toBeInTheDocument();
  });
});
