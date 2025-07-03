export default function Home() {
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
    >
      <main>Hello World</main>
    </div>
  );
}
