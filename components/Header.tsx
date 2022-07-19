import Link from "next/link";
import React from "react";

function Header() {
  return (
    <header>
      <h1>this medium 2.0</h1>
      <div>
        <Link rel="stylesheet" href="/">
          <img className="w-44 object-contain cursor-pointer" src="https://links.papareact.com/yvf" alt="medium logo" />
        </Link>
      </div>
      <div></div>
    </header>
  );
}

export default Header;
