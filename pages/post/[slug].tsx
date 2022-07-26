import { urlFor, sanityClient } from "../../sanity";
import React, { useState } from "react";
import Header from "../../components/Header";
import { Post } from "../../typings";
import { GetStaticProps } from "next";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}
interface Props {
  post: Post;
}

function Post({ post }: Props) {
  console.log(post);
  const [submitted, setSubmitted] = useState(false);
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        console.log(data);
        setSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setSubmitted(false);
      });

    console.log(data);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();
  // console.log("date is: ", new Date(post._createdAt).toLocaleString());

  return (
    <main>
      <Header />
      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt="banner"
      />
      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full "
            src={urlFor(post.author.image).url()}
            alt="author name "
          />
          <p className="font-extralight text-sm ">
            Blog post by{" "}
            <span className="text-green-600">{post.author.name}</span>-
            Published at {new Date(post._createdAt).toLocaleTimeString()} {"- "}
            {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>

        <div>
          <PortableText
            className="mt-10"
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2xl font-bold my-5 " {...props} />
              ),
              h2: (props: any) => (
                <h1 className="text-xl font-bold  my-5" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),

              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {!submitted ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10"
        >
          <h3 className="text-sm text-yellow-500">enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>
          <hr className="py-3 mt-2" />

          <input type="hidden" {...register} value={post._id} name="_id" />

          <label htmlFor="" className="block mb-5 ">
            <span className="text-gray-700 ">
              Name
              <input
                {...register("name", { required: true })}
                className="shadow border rounded py-3 px-2 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                type="text"
                placeholder="John Appleseed"
              />
            </span>
          </label>
          <label htmlFor="" className="block mb-5 ">
            <span>
              Email
              <input
                {...register("email", { required: true })}
                className="shadow border rounded py-3 px-2 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                type="email"
                placeholder="John@gmail.com"
              />
            </span>
          </label>
          <label htmlFor="" className="block mb-5 ">
            <span className="text-gray-700 ">
              Comment
              <textarea
                {...register("comment", { required: true })}
                className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                placeholder="Enter some long comment "
                rows={8}
              />
            </span>
          </label>
          {/* errors */}

          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">- The name field is required</span>
            )}

            {errors.comment && (
              <span className="text-red-500">
                - The Comment Field is required{" "}
              </span>
            )}

            {errors.email && (
              <span className="text-red-500">
                - The Email Field is required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-green-400  focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer transition ease-in duration-500"
          />
        </form>
      ) : (
        <div className="flex flex-col p-10 my-10  bg-yellow-500 text-white max-w-md mx-auto">
          <h3 className="text-3xl font-bold ">
            thank you for submitting your comment
          </h3>
          <p> once the comments have been approved ,it will appear below!</p>
        </div>
      )}

      {/* Comments */}
      <div className="flex flex-col p-10 my-10 mx-auto max-w-2xl shadow-yellow-600 shadow space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div>
            <p>
              <span className="text-yellow-500">{comment.name}</span>:{" "}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Post;
export const getStaticPaths = async () => {
  const query = `
        *[_type == "post"]{
            _id,
            slug{
                current
            }
        } 
    `;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(params?.slug);
  const query = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  author -> {
    name,
    image
  },
  "comments": *[
    _type == "comment" &&
    post._ref == ^._id && 
    approved == true
  ],
  description,
  mainImage,
  slug,
  body
}`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};
