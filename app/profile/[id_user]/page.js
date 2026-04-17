const Page = async ({ params }) => {
  const { id_user } = await params;

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id_user}`,
  );
  const user = await userRes.json();

  return (
    <div>
      <div>name: {user.fullname} </div>
      <div>username: {user.username} </div>
      <div>role: {user.role} </div>
      <div>
        {user.role == "MANDOR"
          ? `certification number: ${user.certificationNumber}`
          : ""}
      </div>
    </div>
  );
};
export default Page;
