import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_libs/supabase";

export type PostsIndexResponse = {
  posts: {
    id: number
    title: string
    content: string
    thumbnailImageKey: string
    createdAt: Date
    updatedAt: Date
    postCategories: {
      category: {
        id: number
        name: string
      }
    }[]
  }[]
}

export const GET = async (requests: NextRequest) => {
  // GET関数の引数からrequestを受け取り、その中にAuthorizationヘッダーが含まれているので、それを取り出す
  const token = requests.headers.get('Authorization') ?? ''

  // supabaseに対してtokenを送る
  const { error} = await supabase.auth.getUser(token)

  // 送ったtokenに対してtokenを送る
  if (error)
    return NextResponse.json({ status: error.message }, { status: 400 })

  // tokenが正しい場合、以降が実行される
  try {
    const posts = await prisma.post.findMany({
      include: {
        postCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 });
  }
};

// 投稿作成時に送られてくるリクエストのbodyの型
export type CreatePostRequestBody = {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailUrl: string
}

// 投稿作成APIのレスポンスの型
export type CreatePostResponse = {
  id: number
}

// POSTという命名にすることで、Postリクエストの時にこの関数が呼ばれる
export const POST = async (request: Request) => {
  try {
    // リクエストのbodyを取得
    const body: CreatePostRequestBody = await request.json()

    // bodyの中からtitle, content, categoris, thumbnailUrlを取り出す
    const { title, content, categories, thumbnailUrl } = body

    // 投稿をDBに生成
    const data = await prisma.post.create({
      data: {
        title,
        content,
        thumbnailImageKey: thumbnailUrl,
      },
    })

    // 記事とカテゴリーの中間テーブルのレコードをDBに生成
    await prisma.postCategory.createMany({
      data: categories.map(category => ({
        categoryId: category.id,
        postId: data.id,
      }))
    })

    // レスポンスを返す
    return NextResponse.json<CreatePostResponse>({
      id: data.id,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}
