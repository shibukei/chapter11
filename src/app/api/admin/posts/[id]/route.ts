import { prisma } from "@/app/_libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export type Category = {
  id: number
  name: string
}

// 記事詳細APIのレスポンスの型
export type PostsShowResponse = {
  post: {
    id: number
    title: string
    content: string
    thumbnailImageKey: string
    createdAt: Date
    updatedAt: Date
    postCategories: {
      category: Category
    }[]
  }
}

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, 
) => {
  const { id } = await params

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
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
    })

    if (!post) {
      return NextResponse.json(
        { message: '記事が見つかりません。' },
        { status: 404 },
      )
    }

    return NextResponse.json<PostsShowResponse>({ post }, { status: 200})
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}

// 記事の更新時に送られてくるリクエストのbodyの型
interface UpdatePostRequestBody {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailUrl: string
}

// PUTという命名にすることで、PUTリクエストの時にこの関数が呼ばれる
export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ここでリクエストパラメータを受け取る
) => {
  // paramsの中にidが入っているので、それを取り出す
  const { id } = await params

  // リクエストのbodyを取得
  const { title, content, categories, thumbnailUrl }: UpdatePostRequestBody = await request.json()

  try {
    // idを指定して、Postを更新
    const post = await prisma.post.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
        content,
        thumbnailImageKey: thumbnailUrl,
      },
    })

    // 一旦、記事とカテゴリーの中間テーブルのレコードを全て削除
    await prisma.postCategory.deleteMany({
      where: {
        postId: parseInt(id),
      },
    })

    // 記事とカテゴリーの中間DBに生成
    await prisma.postCategory.createMany({
      data: categories.map(category => ({
        postId: post.id,
        categoryId: category.id,
      })),
    })

    // レスポンスを返す
    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
  }
}

// DELETEという命名にすることで、DELETEリクエストの時にこの関数が呼ばれる
export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ここでリクエストパラメータを受け取る
) => {
  // paramsの中にidが入っているので、それを取り出す
  const { id } = await params

  try {
    // idを指定して、Postを削除
    await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    })

    // レスポンスを返す
    return NextResponse.json({ message: 'OK' }, { status: 200})
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message }, { status: 400 })
  }
}